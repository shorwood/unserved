import { assertNil, assertString, assertStringUuid, assertUndefined, createArrayParser, createSchema } from '@unshared/validation'
import { createRoute } from '@unserve/server'
import { ModuleUser } from '../index'

export function userRoleUpdate(this: ModuleUser) {
  return createRoute(
    {
      name: 'PUT /api/users/roles/:id',
      parameters: createSchema({
        id: assertStringUuid,
      }),
      body: createSchema({
        name: [[assertUndefined], [assertString]],
        description: [[assertNil], [assertString]],
        permissions: [[assertNil], [createArrayParser(assertString)]],
      }),
    },
    async({ event, parameters, body }) => {

      // --- Check if the user has the right permissions.
      await this.a11n(event, { permissions: [this.permissions.ROLE_UPDATE.id] })

      // --- Find the role.
      const { id } = parameters
      const { UserRole } = this.entities
      const role = await UserRole.findOneBy({ id })
      if (!role) throw this.errors.USER_ROLE_NOT_FOUND(id)

      // --- Update the role.
      if (body.name) role.name = body.name
      if (body.description) role.description = body.description
      if (body.permissions) role.permissions = this.resolvePermissions(body.permissions)
      await role.save()

      // --- Return the role data.
      return role.serialize()
    },
  )
}
