import { createDecipheriv, createHash } from 'node:crypto'
import { assertStringUuid } from '@unshared/validation'
import { toPredicate } from '@unshared/functions'
import { createToken } from './createToken'
import { ModuleUser } from '../index'
import { UserSession } from '../entities'

/**
 * Decrypher a token using the secret key and return the id of the user session
 * associated with the token. If the token is invalid, it throws an error.
 *
 * @param token The encrypted token to decrypt.
 * @returns The decrypted id.
 * @example
 * const token = '...'
 * const key = 'secret'
 *
 * // Decrypt the token using the secret key.
 * const id = tokenDecrypt(token, key) // => '123456'
 */
export function decryptToken(this: ModuleUser, token: string) {
  const iv = Buffer.alloc(16, 0)
  const key = createHash('sha256').update(this.userSessionSecret).digest()
  const id = createDecipheriv(this.userSessionTokenCypher, key, iv).update(token, 'hex', 'utf8').toString()
  const isUuid = toPredicate(assertStringUuid)(id)
  if (!isUuid) throw this.errors.USER_SESSION_NOT_FOUND
  return id
}

/* v8 ignore start */
if (import.meta.vitest) {
  test('should decrypt the token using the secret key', () => {
    const moduleUser = new ModuleUser({ userSessionSecret: 'secret' })
    const userSession = UserSession.create({ id: '00000000-0000-0000-0000-000000000000' })
    const token = createToken.call(moduleUser, userSession)
    const id = decryptToken.call(moduleUser, token)
    expect(id).toBe('00000000-0000-0000-0000-000000000000')
  })

  test('should throw an error if the token is invalid', () => {
    const moduleUser = new ModuleUser({ userSessionSecret: 'secret' })
    const token = 'invalid'
    const shouldThrow = () => decryptToken.call(moduleUser, token)
    expect(shouldThrow).toThrow('User session was not found')
  })
}
