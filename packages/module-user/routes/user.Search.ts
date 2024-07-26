import { ILike } from 'typeorm'
import { assertNumberPositiveStrict, assertString, assertStringNumber, assertUndefined, createSchema } from '@unshared/validation'
import { createRoute } from '@unserve/server'
import { ModuleUser } from '../index'

export function userSearch(this: ModuleUser) {
  return createRoute(
    {
      name: 'GET /api/users',
      query: createSchema({
        search: [[assertUndefined], [assertString]],
        page: [[assertUndefined], [assertStringNumber, Number.parseInt, assertNumberPositiveStrict]],
        limit: [[assertUndefined], [assertStringNumber, Number.parseInt, assertNumberPositiveStrict]],
      }),
    },

    async({ event, query }) => {

      // --- Check if the user has the right permissions.
      await this.a11n(event, { permissions: [this.permissions.USER_SEARCH.id] })

      // --- Destructure the parameters.
      const {
        search,
        page = 1,
        limit = 10,
      } = query

      // --- Get the users.
      const { User } = this.entities
      const users = await User.find({
        where: {
          username: search ? ILike(`%${search}%`) : undefined,
        },
        relations: {
          roles: true,
        },
        order: {
          createdAt: 'DESC',
        },
        skip: (page - 1) * limit,
        take: limit,
      })

      // --- Return the users.
      return users.map(user => user.serialize())
    },
  )
}
