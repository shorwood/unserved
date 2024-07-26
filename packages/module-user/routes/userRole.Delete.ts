import { setResponseStatus } from 'h3'
import { assertStringUuid, createSchema } from '@unshared/validation'
import { createRoute } from '@unserve/server'
import { ModuleUser } from '../index'

export function userRoleDelete(this: ModuleUser) {
  return createRoute(
    {
      name: 'DELETE /api/users/roles/:id',
      parameters: createSchema({
        id: assertStringUuid,
      }),
    },
    async({ event, parameters }) => {

      // --- Check if the user has the right permissions.
      await this.a11n(event, { permissions: [this.permissions.ROLE_DELETE.id] })

      // --- Find the role.
      const { id } = parameters
      const { UserRole } = this.entities
      const role = await UserRole.findOneBy({ id })
      if (!role) throw this.errors.USER_ROLE_NOT_FOUND(id)
      await role.remove()
      setResponseStatus(event, 204)
    },
  )
}
