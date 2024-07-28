import { assertString, assertUndefined, createArrayParser, createSchema } from '@unshared/validation'
import { createRoute } from '@unserve/server'
import { ModuleUser } from '../index'

export function userRoleCreate(this: ModuleUser) {
  return createRoute(
    {
      name: 'POST /api/users/roles',
      body: createSchema({
        name: assertString,
        description: [[assertUndefined], [assertString]],
        permissions: [[assertUndefined], [createArrayParser(assertString)]],
      }),
    },
    async({ event, body }) => {

      // --- Check if the user has the right permissions.
      await this.a11n(event, { permissions: [this.permissions.ROLE_CREATE.id] })

      // --- Create the role.
      const { UserRole } = this.entities
      const role = UserRole.create()
      role.name = body.name
      if (body.description) role.description = body.description
      if (body.permissions) role.permissions = this.resolvePermissions(body.permissions)
      await role.save()

      // --- Return the role data.
      return role.serialize()
    },
  )
}
