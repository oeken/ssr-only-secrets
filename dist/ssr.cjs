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

// src/ssr.ts
var ssr_exports = {};
__export(ssr_exports, {
  readSSROnlySecret: () => readSSROnlySecret,
  useSSROnlySecret: () => useSSROnlySecret
});
module.exports = __toCommonJS(ssr_exports);
var import_optimism = require("optimism");

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
function deserialize(serialized) {
  const [crypt, iv] = serialized.split(":");
  return [
    Buffer.from(crypt, "base64"),
    Uint8Array.from(Buffer.from(iv, "base64"))
  ];
}

// src/ssr.ts
var import_react = require("react");
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
var memoizedReadSSROnlySecret = (0, import_optimism.wrap)(readSSROnlySecret, {
  max: 1e4
});
function useSSROnlySecret(cloakedSecret, encryptionEnvVarName) {
  const promise = memoizedReadSSROnlySecret(
    cloakedSecret,
    encryptionEnvVarName
  );
  return (0, import_react.use)(promise);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  readSSROnlySecret,
  useSSROnlySecret
});
//# sourceMappingURL=ssr.cjs.map