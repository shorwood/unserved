import type { UserObject } from '../entities'
import type { ModuleUser } from '../index'
import { createRoute } from '@unserved/server'
import { assertString, assertStringNotEmpty, assertStringUuid, assertUndefined, createArrayParser, createSchema } from '@unshared/validation'

export function userUpdate(this: ModuleUser) {
  return createRoute(
    {
      name: 'PUT /api/users/:id',
      parameters: createSchema({
        id: assertStringUuid,
      }),
      body: createSchema({
        username: [[assertUndefined], [assertStringNotEmpty]],
        roles: [[assertUndefined], [createArrayParser(assertString)]],
        password: [[assertUndefined], [assertStringNotEmpty]],
        passwordConfirm: [[assertUndefined], [assertStringNotEmpty]],
      }),
    },
    async({ event, parameters, body }): Promise<UserObject> => {

      // --- Check if the user has the right permissions.
      await this.a11n(event, { permissions: [this.permissions.USER_UPDATE.id] })

      // --- Find the user by the ID.
      const { id } = parameters
      const { User } = this.entities
      const user = await User.findOne({
        where: { id },
        relations: { roles: true },
      })

      // --- Update the user.
      if (!user) throw this.errors.USER_NOT_FOUND(id)
      if (body.username) user.username = body.username
      if (body.roles) user.roles = await this.resolveRoles(body.roles)

      // --- Update the password.
      if (body.password) {
        if (body.password !== body.passwordConfirm) throw this.errors.USER_PASSWORD_MISMATCH()
        await user.setPassword(body.password)
      }

      // --- Save and return the user.
      await user.save()
      return user.serialize()
    },
  )
}
