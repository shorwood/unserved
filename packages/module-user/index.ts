import { randomBytes } from 'node:crypto'
import { ModuleBase } from '@unserved/server'
import { ERRORS, PERMISSIONS, a11n, createSession, createToken, decryptToken, resolvePermissions, resolveRoles } from './utils'
import * as ROUTES from './routes'
import * as ENTITIES from './entities'

export * from './entities'

export type ModuleUserOptions = Partial<Pick<
  ModuleUser,
  'userSessionCookieName'
  | 'userSessionDuration'
  | 'userSessionSecret'
  | 'userSessionTokenCypher'
  | 'userTrustProxy'
>>

/**
 * The `ModuleUser` class is used to group all the entities and services related to the user
 * together. It provides H3 routes to perform operations such as sign-in, sign-up, sign-out
 * as well as other user operations.
 */
export class ModuleUser extends ModuleBase {
  errors = ERRORS
  routes = ROUTES
  entities = ENTITIES
  permissions = PERMISSIONS

  constructor(options: ModuleUserOptions = {}) {
    super()
    if (options.userTrustProxy) this.userTrustProxy = options.userTrustProxy
    if (options.userSessionSecret) this.userSessionSecret = options.userSessionSecret
    if (options.userSessionTokenCypher) this.userSessionTokenCypher = options.userSessionTokenCypher
    if (options.userSessionCookieName) this.userSessionCookieName = options.userSessionCookieName
    if (options.userSessionDuration) this.userSessionDuration = options.userSessionDuration
  }

  /**
   * Use the `X-Forwarded-For` HTTP header set by proxies. If `true`, it assumes the
   * server is behind a proxy and the client IP address is set in the `X-Forwarded-For`
   * header. This makes the authentication logic use the IP address from the header
   * instead of the source IP address of the request.
   *
   * @default 'true'
   */
  userTrustProxy = process.env.USER_TRUST_PROXY === 'true'

  /**
   * The secret key used to sign the tokens. This key should be kept secret and should
   * not be shared with anyone. By default, the key is read from the `process.env.USER_SESSION_SECRET`
   * environment variable. If the variable is not set, a random key is generated.
   *
   * @default randomBytes(64).toString('hex')
   */
  userSessionSecret = process.env.USER_SESSION_SECRET ?? randomBytes(64).toString('hex')

  /**
   * The algorithm used to encrypt the user session token
   * and authenticate the user. The algorithm should be
   * secure and should not be easily decrypted.
   *
   * @default 'aes-256-gcm'
   */
  userSessionTokenCypher = process.env.USER_SESSION_TOKEN_CYPHER ?? 'aes-256-gcm'

  /**
   * The cookie name used to store the user session token
   * and authenticate the user. It can be any name but it
   * should be unique.
   *
   * @default '__Secure_Session_ID'
   */
  userSessionCookieName = process.env.USER_SESSION_COOKIE_NAME ?? '__Secure_Session_ID'

  /**
   * The time in milliseconds that the user session token
   * will expire. It should be a reasonable time for the
   * user to stay logged in but not too long to be a
   * security risk.
   *
   * @default 1 day
   */
  userSessionDuration = process.env.USER_SESSION_DURATION
    ? Number.parseInt(process.env.USER_SESSION_DURATION)
    : 1000 * 60 * 60 * 24

  /**
   * The cookie options used when passing the user session
   * token to the client. It follows the best practices for cookie security.
   */
  userSessionCookieOptions = { secure: true, httpOnly: true, sameSite: 'strict' } as const

  /**
   * Authenticate and authorize the user by the token in the Authorization header.
   *
   * @param event The H3 event.
   * @returns The user and session.
   */
  a11n = a11n.bind(this)

  /**
   * Create a new user session with the given user.
   *
   * @param event The H3 event.
   * @param user The user to create the session for.
   * @returns The created user session.
   */
  createSession = createSession.bind(this)

  /**
   * Create a new to token for a given user session.
   *
   * @param session The user session to create the token for.
   * @returns The encrypted token for the session.
   */
  createToken = createToken.bind(this)

  /**
   * Decrypt the token using the secret key.
   *
   * @param token The encrypted token to decrypt.
   * @returns The decrypted id.
   */
  decryptToken = decryptToken.bind(this)

  /**
   * Given a list of permission names, this function resolves the permissions and returns
   * the list of permissions. If a permission does not exist, it creates a new permission
   * with the given name.
   *
   * @param names List of permission names.
   * @returns List of permissions.
   */
  resolvePermissions = resolvePermissions.bind(this)

  /**
   * Given a list of ids, resolve the roles and return the list of `Role` entities.
   *
   * @param ids List of role ids.
   * @returns List of `Role` entities.
   */
  resolveRoles = resolveRoles.bind(this)
}
