import { createCipheriv, createHash } from 'node:crypto'
import { ModuleUser } from '../index'
import { UserSession } from '../entities'

/**
 * Create an encrypted token for the user session using the secret key.
 * The token is used to authenticate and authorize the user.
 *
 * @param session The user session to create the token for.
 * @returns The encrypted token for the session.
 * @example
 * // Create a user session.
 * const userSession = UserSession.create({ id: '123' })
 *
 * // Encrypt the id using the secret key.
 * const token = this.createToken(userSession) // => '2b19e40ca3'
 *
 * // Decrypt the token using the secret key.
 * const id = this.decryptToken(token) // => '123'
 */
export function createToken(this: ModuleUser, session: UserSession) {
  const iv = Buffer.alloc(16, 0)
  const key = createHash('sha256').update(this.userSessionSecret).digest()
  return createCipheriv(this.userSessionTokenCypher, key, iv).update(session.id).toString('hex')
}

/* v8 ignore start */
if (import.meta.vitest) {
  test('should encrypt the id using the secret key', () => {
    const moduleUser = new ModuleUser({ userSessionSecret: 'secret' })
    const userSession = UserSession.create({ id: '00000000-0000-0000-0000-000000000000' })
    const token = createToken.call(moduleUser, userSession)
    expect(token).toBe('2b19e40ca3')
  })
}
