import type { ModuleUser } from '../index'
import { createRoute } from '@unserved/server'
import { assertStringEmail, assertStringNotEmpty, createSchema } from '@unshared/validation'
import { setCookie } from 'h3'

export function userSignupWithPassword(this: ModuleUser) {
  return createRoute(
    {
      name: 'POST /api/signup',
      body: createSchema({
        username: assertStringEmail,
        password: assertStringNotEmpty,
        passwordConfirm: assertStringNotEmpty,
      }),
    },

    async({ event, body }) => {
      const { username, password } = body

      // --- Check if the username is already taken.
      const { User } = this.entities
      const userExists = await User.findOneBy({ username })
      if (userExists) throw this.errors.USER_EMAIL_TAKEN()

      // --- Check if the password and passwordConfirm match.
      if (body.password !== body.passwordConfirm) throw this.errors.USER_PASSWORD_MISMATCH()

      // --- Create the user.
      const user = User.create({ username })
      await user.setPassword(password)
      await user.save()

      // --- Create a session for the user.
      const userSession = this.createSession(event, user)
      await userSession.save()
      const token = this.createToken(userSession)

      // --- Send the token to the user in a cookie.
      setCookie(event, this.userSessionCookieName, token, {
        ...this.userSessionCookieOptions,
        maxAge: (userSession.expiresAt.getTime() - Date.now()) / 1000,
      })
    },
  )
}
