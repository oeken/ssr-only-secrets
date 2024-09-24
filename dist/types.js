// src/ssr.ts
import { wrap } from "optimism";

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
function deserialize(serialized) {
  const [crypt, iv] = serialized.split(":");
  return [
    Buffer.from(crypt, "base64"),
    Uint8Array.from(Buffer.from(iv, "base64"))
  ];
}

// src/ssr.ts
import { use } from "react";
async function readSSROnlySecret(cloakedSecret, encryptionEnvVarName) {
  if (cloakedSecret == void 0) {
    return void 0;
  }
  const key = await getEncryptionKey(encryptionEnvVarName);
  const [crypt, iv] = deserialize(cloakedSecret);
  const decrypted = await crypto.subtle.decrypt(
    {
      name: "AES-CBC",
      iv
    },
    key,
    crypt
  );
  return new TextDecoder().decode(decrypted);
}
var memoizedReadSSROnlySecret = wrap(readSSROnlySecret, {
  max: 1e4
});
function useSSROnlySecret(cloakedSecret, encryptionEnvVarName) {
  const promise = memoizedReadSSROnlySecret(
    cloakedSecret,
    encryptionEnvVarName
  );
  return use(promise);
}

// src/rsc.ts
import { experimental_taintUniqueValue } from "react";
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

// src/types.ts
var _ = void 0;
export {
  _,
  cloakSSROnlySecret,
  readSSROnlySecret,
  useSSROnlySecret
};
//# sourceMappingURL=types.js.map