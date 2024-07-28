import { deleteCookie, setResponseStatus } from 'h3'
import { createRoute } from '@unserved/server'
import { ModuleUser } from '../index'

export function userSignout(this: ModuleUser) {
  return createRoute('DELETE /api/signout', async({ event }) => {
    try {
      const { userSession } = await this.a11n(event)
      await userSession!.softRemove()
    }

    catch { /* Ignore the error and continue. */ }
    setResponseStatus(event, 204)
    deleteCookie(event, this.userSessionCookieName)
  })
}
