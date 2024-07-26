import { ScryptOptions, randomBytes, scrypt } from 'node:crypto'

/**
 * Options to hash the password of the user. It includes the length of the
 * hash that will be generated.
 */

export interface PasswordOptions extends ScryptOptions {

  /**
   * Length of the hash that will be generated. It is recommended to use
   * a length of 512 bits.
   *
   * @default 512
   */
  keylen?: number

  /**
   * Encoding of the hash when stored in the database. It can be any
   * of the supported encodings by Node.js.
   *
   * @default 'hex'
   */
  encoding?: BufferEncoding

  /**
   * The salt to hash the password. By default, a random salt is generated
   * but it can be provided to hash the password with a specific salt and
   * compare it with the stored hash.
   *
   * @default randomBytes(32).toString(encoding)
   */
  salt?: string
}

/**
 * Create a password hash using the Scrypt algorithm. It generates a random
 * salt and hashes the password using the options provided. The default options
 * are provided by OWASP and are recommended for password hashing.
 *
 * @param password The password to hash.
 * @param options The options to hash the password.
 * @returns The salt, hash, and options used to hash the password.
 * @see https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#scrypt
 * @example await createPassword('password', USER_HASH_OPTIONS) // => { salt, hash, options }
 */
export async function createPassword(password: string, options: PasswordOptions = {}) {
  const {
    keylen = 32,
    encoding = 'hex',
    N = 16384,
    r = 8,
    p = 1,
    maxmem = 64 * 1024 * 1024,
    salt = randomBytes(32).toString(encoding),
  } = options

  // --- Hash the password using the scrypt algorithm.
  const hashOptions = { N, r, p, maxmem }
  const hash = await new Promise<string>((resolve, reject) =>
    scrypt(password, salt, keylen, hashOptions, (error, derivedKey) => {
      if (error) reject(error)
      else resolve(derivedKey.toString(encoding))
    }))

  // --- Return the salt, hash, and options used to hash the password.
  const passowrdOptions = { algorithm: 'scrypt', ...hashOptions, keylen, encoding, salt }
  return { hash, options: passowrdOptions }
}

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* v8 ignore start */
if (import.meta.vitest) {
  test('should return the hash of the password', async() => {
    const { hash } = await createPassword('password')
    expect(hash).toBeTypeOf('string')
  })

  test('should return the options used to hash the password', async() => {
    const { options } = await createPassword('password')
    expect(options).toMatchObject({
      algorithm: 'scrypt',
      N: 16384,
      r: 8,
      p: 1,
      maxmem: 67108864,
      keylen: 32,
      encoding: 'hex',
      salt: expect.stringMatching(/^[\da-f]{64}$/),
    })
  })

  test('should return the hash of the password with the provided salt', async() => {
    const salt = 'salt'
    const result = await createPassword('password', { salt })
    expect(result).toStrictEqual({
      hash: '745731af4484f323968969eda289aeee005b5903ac561e64a5aca121797bf773',
      options: {
        algorithm: 'scrypt',
        N: 16384,
        r: 8,
        p: 1,
        maxmem: 67108864,
        keylen: 32,
        encoding: 'hex',
        salt: 'salt',
      },
    })
  })

  test('should not generate the same hash for the same password', async() => {
    const result1 = await createPassword('password')
    const result2 = await createPassword('password')
    expect(result1.hash).not.toStrictEqual(result2.hash)
  })
}
