import type { ModuleUser } from '../index'
import { createRoute } from '@unserved/server'
import { assertStringEmail, assertStringNotEmpty, createSchema } from '@unshared/validation'
import { setCookie } from 'h3'

export function userSigninWithPassword(this: ModuleUser) {
  return createRoute(
    {
      name: 'POST /api/signin',
      body: createSchema({
        username: assertStringEmail,
        password: assertStringNotEmpty,
      }),
    },

    async({ event, body }) => {
      const { username, password } = body
      const { User } = this.entities

      // --- Try authenticating the user from the Cookie.
      // --- If successful, do not create a new session.
      try {
        await this.a11n(event)
        return
      }
      catch { /* Ignore the error and continue. */ }

      // --- Get the user by the username and check the password.
      const user = await User.findOneBy({ username })
      if (!user) throw this.errors.USER_BAD_CREDENTIALS()
      const isPasswordCorrect = await user.checkPassword(password)
      if (!isPasswordCorrect) throw this.errors.USER_BAD_CREDENTIALS()

      // --- Create a session for the user and return it's associated token.
      const userSession = this.createSession(event, user)
      await userSession.save()
      const token = this.createToken(userSession)
      setCookie(event, this.userSessionCookieName, token, {
        ...this.userSessionCookieOptions,
        maxAge: (userSession.expiresAt.getTime() - Date.now()) / 1000,
      })
    },
  )
}
