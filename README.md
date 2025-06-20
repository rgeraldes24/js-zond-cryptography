# zond-cryptography

[![npm version][1]][2] [![Travis CI][3]][4] [![license][5]][6] [![Types][7]][8]

All pure-js cryptographic primitives normally used when
developing Javascript / TypeScript applications and tools for Zond.

The cryptographic primitives included are:

* [Hashes: keccak-256](#hashes-keccak-256)
* [KDFs: PBKDF2, Scrypt](#kdfs-pbkdf2-scrypt)
* [CSPRNG (Cryptographically strong pseudorandom number generator)](#csprng-cryptographically-strong-pseudorandom-number-generator)
* [AES Encryption](#aes-encryption)

## Usage

Use NPM / Yarn in node.js / browser:

```bash
# NPM
npm install zond-cryptography

# Yarn
yarn add zond-cryptography
```

See [browser usage](#browser-usage) for information on using the package with major Javascript bundlers. It is
tested with **Webpack, Rollup, Parcel and Browserify**.

This package has no single entry-point, but submodule for each cryptographic
primitive. Read each primitive's section of this document to learn how to use
them.

The reason for this is that importing everything from a single file will lead to
huge bundles when using this package for the web. This could be avoided through
tree-shaking, but the possibility of it not working properly on one of
[the supported bundlers](#browser-usage) is too high.

```js
// Hashes
const { keccak256 } = require("zond-cryptography/keccak");

// KDFs
const { pbkdf2Sync } = require("zond-cryptography/pbkdf2");
const { scryptSync } = require("zond-cryptography/scrypt");

// Random
const { getRandomBytesSync } = require("zond-cryptography/random");

// AES encryption
const { encrypt } = require("zond-cryptography/aes");

// utilities
const { hexToBytes, toHex, utf8ToBytes } = require("zond-cryptography/utils");
```

## Hashes: keccak-256
```typescript
function keccak256(msg: Uint8Array): Uint8Array;
```

Exposes following cryptographic hash functions:

- keccak-256 variant of SHA3 (also `keccak224`, `keccak384`,
and `keccak512`)

```js
const { keccak256, keccak224, keccak384, keccak512 } = require("zond-cryptography/keccak");

keccak256(Uint8Array.from([1, 2, 3]))

// Can be used with strings
const { utf8ToBytes } = require("zond-cryptography/utils");
keccak256(utf8ToBytes("abc"))

// If you need hex
const { bytesToHex as toHex } = require("zond-cryptography/utils");
toHex(keccak256(utf8ToBytes("abc")))
```

## KDFs: PBKDF2, Scrypt

```ts
function pbkdf2(password: Uint8Array, salt: Uint8Array, iterations: number, keylen: number, digest: string): Promise<Uint8Array>;
function pbkdf2Sync(password: Uint8Array, salt: Uint8Array, iterations: number, keylen: number, digest: string): Uint8Array;
function scrypt(password: Uint8Array, salt: Uint8Array, N: number, p: number, r: number, dkLen: number, onProgress?: (progress: number) => void): Promise<Uint8Array>;
function scryptSync(password: Uint8Array, salt: Uint8Array, N: number, p: number, r: number, dkLen: number, onProgress?: (progress: number) => void)): Uint8Array;
```

The `pbkdf2` submodule has two functions implementing the PBKDF2 key
derivation algorithm in synchronous and asynchronous ways. This algorithm is
very slow, and using the synchronous version in the browser is not recommended,
as it will block its main thread and hang your UI. The KDF supports `sha256` and `sha512` digests.

The `scrypt` submodule has two functions implementing the Scrypt key
derivation algorithm in synchronous and asynchronous ways. This algorithm is
very slow, and using the synchronous version in the browser is not recommended,
as it will block its main thread and hang your UI.

Encoding passwords is a frequent source of errors. Please read
[these notes](https://github.com/ricmoo/scrypt-js/tree/0eb70873ddf3d24e34b53e0d9a99a0cef06a79c0#encoding-notes)
before using these submodules.

```js
const { pbkdf2 } = require("zond-cryptography/pbkdf2");
const { utf8ToBytes } = require("zond-cryptography/utils");
// Pass Uint8Array, or convert strings to Uint8Array
console.log(await pbkdf2(utf8ToBytes("password"), utf8ToBytes("salt"), 131072, 32, "sha256"));
```

```js
const { scrypt } = require("zond-cryptography/scrypt");
const { utf8ToBytes } = require("zond-cryptography/utils");
console.log(await scrypt(utf8ToBytes("password"), utf8ToBytes("salt"), 262144, 8, 1, 32));
```

## CSPRNG (Cryptographically strong pseudorandom number generator)

```ts
function getRandomBytes(bytes: number): Promise<Uint8Array>;
function getRandomBytesSync(bytes: number): Uint8Array;
```

The `random` submodule has functions to generate cryptographically strong
pseudo-random data in synchronous and asynchronous ways.

Backed by [`crypto.getRandomValues`](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues) in browser and by [`crypto.randomBytes`](https://nodejs.org/api/crypto.html#crypto_crypto_randombytes_size_callback) in node.js. If backends are somehow not available, the module would throw an error and won't work, as keeping them working would be insecure.

```js
const { getRandomBytesSync } = require("zond-cryptography/random");
console.log(getRandomBytesSync(32));
```

## AES Encryption

```ts
function encrypt(msg: Uint8Array, key: Uint8Array, iv: Uint8Array, mode = "aes-256-gcm"): Promise<Uint8Array>;
function decrypt(cypherText: Uint8Array, key: Uint8Array, iv: Uint8Array, mode = "aes-256-gcm"): Promise<Uint8Array>;
```

The `aes` submodule contains encryption and decryption functions implementing
the [Advanced Encryption Standard](https://en.wikipedia.org/wiki/Advanced_Encryption_Standard)
algorithm.

### Encrypting with passwords

AES is not supposed to be used directly with a password. Doing that will
compromise your users' security.

The `key` parameters in this submodule are meant to be strong cryptographic
keys. If you want to obtain such a key from a password, please use a
[key derivation function](https://en.wikipedia.org/wiki/Key_derivation_function)
like [pbkdf2](#pbkdf2-submodule) or [scrypt](#scrypt-submodule).

### Operation modes

This submodule works with different [block cipher modes of operation](https://en.wikipedia.org/wiki/Block_cipher_mode_of_operation). If you are using this module in a new
application, we recommend using the default.

While this module may work with any mode supported by OpenSSL, we only test it
with `aes-128-ctr`, `aes-128-cbc`, and `aes-256-cbc`. If you use another module
a warning will be printed in the console.

We only recommend using `aes-128-cbc` and `aes-256-cbc` to decrypt already
encrypted data.

### Padding plaintext messages

Some operation modes require the plaintext message to be a multiple of `16`. If
that isn't the case, your message has to be padded.

By default, this module automatically pads your messages according to [PKCS#7](https://tools.ietf.org/html/rfc2315).
Note that this padding scheme always adds at least 1 byte of padding. If you
are unsure what anything of this means, we **strongly** recommend you to use
the defaults.

If you need to encrypt without padding or want to use another padding scheme,
you can disable PKCS#7 padding by passing `false` as the last argument and
handling padding yourself. Note that if you do this and your operation mode
requires padding, `encrypt` will throw if your plaintext message isn't a
multiple of `16`.

This option is only present to enable the decryption of already encrypted data.
To encrypt new data, we recommend using the default.

### How to use the IV parameter

The `iv` parameter of the `encrypt` function must be unique, or the security
of the encryption algorithm can be compromised.

You can generate a new `iv` using the `random` module.

Note that to decrypt a value, you have to provide the same `iv` used to encrypt
it.

### How to handle errors with this module

Sensitive information can be leaked via error messages when using this module.
To avoid this, you should make sure that the errors you return don't
contain the exact reason for the error. Instead, errors must report general
encryption/decryption failures.

Note that implementing this can mean catching all errors that can be thrown
when calling on of this module's functions, and just throwing a new generic
exception.

### Example usage

```js
const { encrypt } = require("zond-cryptography/aes");
const { hexToBytes, utf8ToBytes } = require("zond-cryptography/utils");

console.log(
  encrypt(
    utf8ToBytes("message"),
    hexToBytes("2b7e151628aed2a6abf7158809cf4f3c"),
    hexToBytes("f0f1f2f3f4f5f6f7f8f9fafbfcfdfeff")
  )
);
```

## Browser usage

### Rollup setup

Using this library with Rollup requires the following plugins:

* [`@rollup/plugin-commonjs`](https://www.npmjs.com/package/@rollup/plugin-commonjs)
* [`@rollup/plugin-node-resolve`](https://www.npmjs.com/package/@rollup/plugin-node-resolve)

These can be used by setting your `plugins` array like this:

```js
  plugins: [
    commonjs(),
    resolve({
      browser: true,
      preferBuiltins: false,
    }),
  ]
```

## License

`zond-cryptography` is released under The MIT License (MIT)

Copyright (c) 2021 Patricio Palladino, Paul Miller, zond-cryptography contributors

See [LICENSE](./LICENSE) file.