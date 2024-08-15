import type { ModuleUser } from '../index'
import { createRoute } from '@unserved/server'

export function userMeSignedIn(this: ModuleUser) {
  return createRoute(
    {
      name: 'OPTIONS /api/me',
    },
    async({ event }) => {
      const { user } = await this.a11n(event, { optional: true })
      return { isSignedIn: !!user }
    },
  )
}
