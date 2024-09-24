/**
 * Decrypts a secret that was created in a Server Component using
 * `cloakSSROnlySecret`.
 *
 * Calling this in a Browser environment will always return `undefined`.
 *
 * Only available in Client Components.
 *
 * @public
 */
declare function readSSROnlySecret(cloakedSecret: string | undefined, encryptionEnvVarName: string): Promise<string | undefined>;
/**
 * Decrypts a secret that was created in a Server Component using
 * `cloakSSROnlySecret`.
 * If called during SSR, this hook will briefly suspend your component and
 * then return the decrypted secret.
 *
 * Calling this in a Browser environment will always return `undefined`.
 *
 * Only available in Client Components.
 *
 * @public
 */
declare function useSSROnlySecret(cloakedSecret: string | undefined, encryptionEnvVarName: string): string | undefined;

export { readSSROnlySecret, useSSROnlySecret };
