declare module "react" {
    type TypedArray = Int8Array | Uint8Array | Uint8ClampedArray | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array | Float64Array | BigInt64Array | BigUint64Array;
    const experimental_taintUniqueValue: undefined | ((message: string, lifetime: object, value: string | bigint | TypedArray) => void);
}
/**
 * Encrypts a secret so that it can be passed from Server Components into the
 * SSR-run of Client Components without them being accessible in the browser.
 *
 * Use `useSSROnlySecret` or `readSSROnlySecret` to decrypt the secret in your
 * Client Component.
 *
 * Only available in Server Components.
 *
 * @public
 */
declare function cloakSSROnlySecret(secret: string, encryptionEnvVarName: string): Promise<string>;

export { cloakSSROnlySecret };
