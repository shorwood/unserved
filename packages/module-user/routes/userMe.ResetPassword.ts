import type { ModuleUser } from '../index'
import { createRoute } from '@unserved/server'
import { assertStringEmail, createSchema } from '@unshared/validation'

export function handleUserResetPassword(this: ModuleUser) {
  return createRoute(
    {
      name: 'POST /api/me/reset-password',
      body: createSchema({
        username: assertStringEmail,
      }),
    },

    async({ body }) => {
      const { username } = body

      // --- Find the user by email. Allowing us to send a reset password email.
      // --- If user was not found, don't do anything to avoid leaking information.
      const { User } = this.entities
      const user = await User.findOneBy({ username })
      if (!user) return

      // --- Reset the password.
      // await user.resetPassword()
    },
  )
}
