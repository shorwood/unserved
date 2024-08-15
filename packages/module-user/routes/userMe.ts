import type { ModuleUser } from '../index'
import { createRoute } from '@unserved/server'

export function userMeGet(this: ModuleUser) {
  return createRoute(
    {
      name: 'GET /api/me',
    },
    async({ event }) => {
      const { user } = await this.a11n(event)
      if (!user) throw this.errors.USER_NOT_FOUND('me')
      return user.serialize()
    },
  )
}
