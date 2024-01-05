# ssr-only-secrets

This package provides a way to pass secrets from Server Components into the SSR-run of Client Components without them being accessible in the browser.

This technique was inspired by [this comment](https://github.com/apollographql/apollo-client-nextjs/issues/85#issuecomment-1753442277) by [@Stevemoretz](https://github.com/Stevemoretz)<!-- -->.

<h2>Usage:</h2>

Install the package

```sh
npm i ssr-only-secrets
```
Generate a jwk-formatted AES-CBC key, e.g. by running

```js
crypto.subtle
  .generateKey(
    {
      name: "AES-CBC",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  )
  .then((key) => crypto.subtle.exportKey("jwk", key))
  .then(JSON.stringify)
  .then(console.log);
```
and store the result in an environment variable, e.g. `SECRET_KEY_VAR`<!-- -->, e.g. by writing it into your `.env.local`<!-- -->.

```env
SECRET_KEY_VAR={"alg":"A256CBC","ext":true,"k":"...","key_ops":["encrypt","decrypt"],"kty":"oct"}
```
Now, you can pass "cloaked secrets" from your Server Components into the SSR-run of your Client Components, without them being accessible in your Client Components in the browser.

## Example

In a Server Component:

```jsx
import { cloakSSROnlySecret } from "ssr-only-secrets";

const MyServerComponent = () => {
    const secretValue = "my secret value"
    return <ClientComponent ssrOnlySecret={cloakSSROnlySecret(secretValue, "SECRET_KEY_VAR")} />
}
```
And in a Client Component

```jsx
import { useSSROnlySecret } from "ssr-only-secrets";

const ClientComponent = ({ssrOnlySecret}, "SECRET_KEY_VAR") => {
    const value = useSSROnlySecret(ssrOnlySecret);
    console.log(value); // during SSR, this logs "my secret value", but in the browser, it logs "undefined"
}
```
Alternatively, you can decrypt the secret in your code by calling `readSSROnlySecret`<!-- -->, e.g. in an Apollo Link:

```jsx
const value = await readSSROnlySecret(ssrOnlySecret)
```

## Functions

|  Function | Description |
|  --- | --- |
|  [cloakSSROnlySecret(secret, encryptionEnvVarName)](https://github.com/phryneas/ssr-only-secrets/blob/main/docs/ssr-only-secrets.cloakssronlysecret.md) | <p>Encrypts a secret so that it can be passed from Server Components into the SSR-run of Client Components without them being accessible in the browser.</p><p>Use <code>useSSROnlySecret</code> or <code>readSSROnlySecret</code> to decrypt the secret in your Client Component.</p><p>Only available in Server Components.</p> |
|  [readSSROnlySecret(cloakedSecret, encryptionEnvVarName)](https://github.com/phryneas/ssr-only-secrets/blob/main/docs/ssr-only-secrets.readssronlysecret.md) | <p>Decrypts a secret that was created in a Server Component using <code>cloakSSROnlySecret</code>.</p><p>Calling this in a Browser environment will always return <code>undefined</code>.</p><p>Only available in Client Components.</p> |
|  [useSSROnlySecret(cloakedSecret, encryptionEnvVarName)](https://github.com/phryneas/ssr-only-secrets/blob/main/docs/ssr-only-secrets.usessronlysecret.md) | <p>Decrypts a secret that was created in a Server Component using <code>cloakSSROnlySecret</code>. If called during SSR, this hook will briefly suspend your component and then return the decrypted secret.</p><p>Calling this in a Browser environment will always return <code>undefined</code>.</p><p>Only available in Client Components.</p> |

