import type { ModuleUser } from '../index'
import { createRoute } from '@unserved/server'
import { assertString, assertStringNumber, assertUndefined, createSchema } from '@unshared/validation'
import { ILike } from 'typeorm'

export function userRoleSearch(this: ModuleUser) {
  return createRoute(
    {
      name: 'GET /api/users/roles',
      query: createSchema({
        search: [[assertUndefined], [assertString]],
        page: [[assertUndefined], [assertStringNumber, Number.parseInt]],
        limit: [[assertUndefined], [assertStringNumber, Number.parseInt]],
      }),
    },
    async({ event, query }) => {

      // --- Check if the user has the right permissions.
      await this.a11n(event, { permissions: [this.permissions.ROLE_SEARCH.id] })

      // --- Destructure the query.
      const {
        search,
        page = 1,
        limit = 10,
      } = query

      // --- Find the roles based on the search query.
      const { UserRole } = this.entities
      const roles = await UserRole.find({
        where: {
          name: search ? ILike(`%${search}%`) : undefined,
        },
        take: limit,
        skip: (page - 1) * limit,
      })

      // --- Return the list of roles.
      return roles.map(role => role.serialize())
    },
  )
}
