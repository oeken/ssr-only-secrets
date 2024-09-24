// src/rsc.ts
import { experimental_taintUniqueValue } from "react";

// src/shared.ts
function getEncryptionKey(envVarName) {
  if (envVarName == void 0) {
    throw new Error(
      "You need to specify the name for a secret-holding environment variable."
    );
  }
  if (envVarName.startsWith("NEXT_PUBLIC_")) {
    throw new Error(
      "You cannot use NEXT_PUBLIC_ environment variables for secrets, as they would be transported to the browser."
    );
  }
  const encryption_key = process.env[envVarName];
  if (!encryption_key) {
    throw new Error(
      "There is no environment variable named " + envVarName + "."
    );
  }
  let parsed;
  try {
    const buffer = Buffer.from(encryption_key, "base64");
    const decodedKey = buffer.toString("utf8");
    parsed = JSON.parse(decodedKey);
  } catch {
    throw new Error(
      "The environment variable " + envVarName + " does not contain a valid JSON string."
    );
  }
  return crypto.subtle.importKey("jwk", parsed, "AES-CBC", false, [
    "encrypt",
    "decrypt"
  ]);
}
function serialize(crypt, iv) {
  return Buffer.from(crypt).toString("base64") + ":" + Buffer.from(iv).toString("base64");
}

// src/rsc.ts
async function cloakSSROnlySecret(secret, encryptionEnvVarName) {
  if (experimental_taintUniqueValue) {
    experimental_taintUniqueValue(
      `Do not pass the content of the envrionment variable "${encryptionEnvVarName}" directly into client component props. This is unsafe!`,
      process,
      secret
    );
  }
  const key = await getEncryptionKey(encryptionEnvVarName);
  const encoded = new TextEncoder().encode(secret);
  const iv = crypto.getRandomValues(new Uint8Array(16));
  const crypt = crypto.subtle.encrypt(
    {
      name: "AES-CBC",
      iv
    },
    key,
    encoded
  );
  return serialize(await crypt, iv);
}
export {
  cloakSSROnlySecret
};
//# sourceMappingURL=rsc.js.map