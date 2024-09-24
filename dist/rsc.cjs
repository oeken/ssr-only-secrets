"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/rsc.ts
var rsc_exports = {};
__export(rsc_exports, {
  cloakSSROnlySecret: () => cloakSSROnlySecret
});
module.exports = __toCommonJS(rsc_exports);
var import_react = require("react");

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
  if (import_react.experimental_taintUniqueValue) {
    (0, import_react.experimental_taintUniqueValue)(
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  cloakSSROnlySecret
});
//# sourceMappingURL=rsc.cjs.map