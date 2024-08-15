import type { ModuleUser } from '../index'
import { createRoute } from '@unserved/server'
import { assertStringUuid, createSchema } from '@unshared/validation'

export function userRoleGet(this: ModuleUser) {
  return createRoute(
    {
      name: 'GET /api/users/roles/:id',
      parameters: createSchema({
        id: assertStringUuid,
      }),
    },
    async({ event, parameters }) => {

      // --- Check if the user has the right permissions.
      await this.a11n(event, { permissions: [this.permissions.ROLE_READ.id] })

      // --- Find the role.
      const { id } = parameters
      const { UserRole } = this.entities
      const role = await UserRole.findOneBy({ id })
      if (!role) throw this.errors.USER_ROLE_NOT_FOUND(id)
      return role.serialize()
    },
  )
}
