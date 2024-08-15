import type { ModuleUser } from '../index'
import { createRoute } from '@unserved/server'
import { parseBoolean } from '@unshared/string'
import { assertString, assertStringUuid, assertUndefined, createSchema } from '@unshared/validation'

export function userGet(this: ModuleUser) {
  return createRoute(
    {
      name: 'GET /api/users/:id',
      parameters: createSchema({
        id: assertStringUuid,
      }),
      query: createSchema({
        withRoles: [[assertUndefined], [assertString, parseBoolean]],
      }),
    },
    async({ event, parameters, query }) => {

      // --- Check if the user has the right permissions.
      await this.a11n(event, { permissions: [this.permissions.USER_READ.id] })

      // --- Destructure the query.
      const {
        withRoles = false,
      } = query

      // --- Fetch the user.
      const { id } = parameters
      const { User } = this.entities
      const user = await User.findOne({
        where: { id },
        relations: {
          roles: withRoles,
        },
      })

      // --- Return the user.
      if (!user) throw this.errors.USER_NOT_FOUND(id)
      return user.serialize()
    },
  )
}
