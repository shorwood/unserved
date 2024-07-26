import { createRoute } from '@unserve/server'
import { ModuleUser } from '../index'

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
