import type { H3Event } from 'h3'
import type { ModuleUser } from '../index'
import { getCookie, getHeader, getRequestIP } from 'h3'

export interface A11nOptions {

  /**
   * If `true`, it won't throw an error if the user session was not found or
   * was invalid. Instead, it will return `undefined`.
   */
  optional?: boolean

  /**
   * The permissions the user must have to access the resource. If the user
   * does not have the required permissions, it throws an error.
   */
  permissions?: string[]
}

/**
 * Authenticate and authorize the user by the token in the Authorization header
 * and return it's associated `User` and `UserSession` entities. If the user
 * session is not found, expired, or the IP address does not match, it throws
 * an error.
 *
 * @param event The H3 event.
 * @param options The options to customize the authentication and authorization.
 * @returns The user and session.
 */
export async function a11n(this: ModuleUser, event: H3Event, options: A11nOptions = {}) {
  const { UserSession } = this.entities
  const { optional = false, permissions = [] } = options

  try {

    // --- Extract and decrypt the token from the Authorization header.
    const token = getCookie(event, this.userSessionCookieName)
    if (!token) throw this.errors.USER_SESSION_NOT_FOUND()
    const id = this.decryptToken(token)

    // --- Find the user session by the token.
    const userSession = await UserSession.findOne({
      where: { id },
      withDeleted: true,
      relations: {
        user: { roles: true },
      },
    })

    // --- Get the IP address and user agent.
    const requestIp = getRequestIP(event, { xForwardedFor: this.userTrustProxy })
    const userAgent = getHeader(event, 'User-Agent')
    const address = requestIp?.split(':')[0]

    // --- Assert the session exists and the user is not soft deleted.
    const now = new Date()
    if (!userSession) throw this.errors.USER_SESSION_NOT_FOUND()
    if (!userSession.user) throw this.errors.USER_SESSION_NOT_FOUND()
    if (userSession.user.deletedAt) throw this.errors.USER_SESSION_EXPIRED()
    if (userSession.expiresAt < now) throw this.errors.USER_SESSION_EXPIRED()
    if (userSession.address !== address) throw this.errors.USER_SESSION_NOT_FOUND()
    if (userSession.userAgent !== userAgent) throw this.errors.USER_SESSION_NOT_FOUND()

    // --- Check the permissions.
    if (!userSession.user.isAdministrator) {
      for (const permission of permissions) {
        if (!userSession.user.hasPermission(permission))
          throw this.errors.USER_NOT_ALLOWED()
      }
    }

    // --- Return the user and session.
    return { user: userSession.user, userSession }
  }

  catch (error) {
    if (optional) return { user: undefined, userSession: undefined }
    throw error
  }
}
