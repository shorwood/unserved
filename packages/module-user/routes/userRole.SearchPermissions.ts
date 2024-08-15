/* eslint-disable sonarjs/no-duplicated-branches */
import type { PermissionObject } from '@unserved/server'
import type { ModuleUser } from '../index'
import { createRoute } from '@unserved/server'
import { assertString, assertStringNumber, assertUndefined, createSchema } from '@unshared/validation'

export interface UserPermissionsSearchResult {
  id?: string
  name: string
  description?: string
}

export function userRoleSearchPermissions(this: ModuleUser) {
  return createRoute(
    {
      name: 'GET /api/users/permissions',
      query: createSchema({
        search: [[assertUndefined], [assertString]],
        page: [[assertUndefined], [assertStringNumber, Number.parseInt]],
        limit: [[assertUndefined], [assertStringNumber, Number.parseInt]],
      }),
    },
    async({ event, query }) => {

      // --- Check if the user has the right permissions.
      await this.a11n(event, { permissions: [this.permissions.ROLE_READ.id] })

      // --- Destructure the query.
      const {
        search = '',
        page = 1,
        limit = 10,
      } = query

      // --- Load the permissions from the local modules and the database.
      const modules = this.getApplication().modules
      const permissions = modules.flatMap(module => Object.values(module.permissions))
      const result: PermissionObject[] = []

      // --- If no search string is provided, return all the permissions.
      if (!search) return permissions.slice((page - 1) * limit, page * limit)
      const s = search.toLowerCase()

      // --- Filter the permissions by the search string.
      for (const permission of permissions) {
        if (typeof permission !== 'object') continue
        const id = permission.id
        const name = permission.name?.toLowerCase()
        const desc = permission.description?.toLowerCase()
        if (name?.includes(s)) result.push(permission)
        else if (id?.includes(s)) result.push(permission)
        else if (desc?.includes(s)) result.push(permission)
      }

      // --- Paginate the results.
      return result.slice((page - 1) * limit, page * limit)
    },
  )
}
