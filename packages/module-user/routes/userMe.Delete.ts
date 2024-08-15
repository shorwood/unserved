import type { ModuleUser } from '../index'
import { createRoute } from '@unserved/server'
import { setResponseStatus } from 'h3'

export function userMeDelete(this: ModuleUser) {
  return createRoute('DELETE /api/me', async({ event }) => {
    const { user } = await this.a11n(event)
    if (!user) return this.errors.USER_SESSION_NOT_FOUND()

    // --- Expire all the user sessions.
    const { UserSession } = this.entities
    const sessions = await UserSession.findBy({ user })
    const promises = sessions.map(async(session) => {
      session.expiresAt = new Date()
      await session.save()
    })

    // --- Delete the user.
    await Promise.all(promises)
    await user.softRemove()
    setResponseStatus(event, 204)
  })
}
