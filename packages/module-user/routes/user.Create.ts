import { assertNil, assertString, createArrayParser, createSchema } from '@unshared/validation'
import { createRoute } from '@unserve/server'
import { ModuleUser } from '../index'

export function userCreate(this: ModuleUser) {
  return createRoute(
    {
      name: 'POST /api/users',
      body: createSchema({
        username: assertString,
        roles: [[assertNil], [createArrayParser(assertString)]],
        password: assertString,
        passwordConfirm: assertString,
      }),
    },
    async({ event, body }) => {

      // --- Check if the user has the right permissions.
      await this.a11n(event, { permissions: [this.permissions.USER_CREATE.id] })

      // --- Check if the username is already taken.
      const { username } = body
      const { User } = this.entities
      const userExists = await User.findOneBy({ username })
      if (userExists) return this.errors.USER_EMAIL_TAKEN

      // --- Create the user.
      const user = User.create()
      user.username = username
      user.roles = await this.resolveRoles(body.roles)

      // --- Update the password.
      if (body.password !== body.passwordConfirm) throw this.errors.USER_PASSWORD_MISMATCH()
      await user.setPassword(body.password)

      // --- Save and return the user.
      await user.save()
      return user.serialize()
    },
  )
}
