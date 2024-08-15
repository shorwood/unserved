import type { H3Event } from 'h3'
import type { User } from '../entities'
import type { ModuleUser } from '../index'
import { getHeader, getRequestIP } from 'h3'
import { UserSession } from '../entities'

export function createSession(this: ModuleUser, event: H3Event, user: User): UserSession {

  // --- Get the IP address and user agent.
  const requestIp = getRequestIP(event, { xForwardedFor: this.userTrustProxy })
  const userAgent = getHeader(event, 'User-Agent')
  if (!requestIp || !userAgent) throw this.errors.USER_SESSION_MISSING_HEADER()
  const address = requestIp.split(':')[0]

  // --- Create a session for the user.
  const userSession = UserSession.create()
  userSession.user = user
  userSession.address = address
  userSession.userAgent = userAgent
  userSession.expiresAt = new Date(Date.now() + this.userSessionDuration)
  return userSession
}
