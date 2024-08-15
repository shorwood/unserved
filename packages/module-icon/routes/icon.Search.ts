import type { ModuleIcon } from '../index'
import { ModuleUser } from '@unserved/module-user'
import { createRoute } from '@unserved/server'
import { parseBoolean } from '@unshared/string'
import { assertString, assertStringNumber, assertUndefined, createParser } from '@unshared/validation'
import { ILike, In } from 'typeorm'

export function iconSearch(this: ModuleIcon) {
  return createRoute(
    {
      name: 'GET /api/icons',
      query: createParser({
        search: [[assertUndefined], [assertString]],
        colletions: [[assertUndefined], [assertString, (s: string) => s.split(',')]],
        page: [[assertUndefined], [assertStringNumber, Number.parseInt]],
        limit: [[assertUndefined], [assertStringNumber, Number.parseInt]],
        withSvg: [[assertUndefined], [assertString, parseBoolean]],
      }),
    },
    async({ event, query }) => {

      // --- Assert permissions.
      const userModule = this.getModule(ModuleUser)
      await userModule.a11n(event, { permissions: [this.permissions.ICON_SEARCH.id] })

      // --- Decompose the query.
      const { Icon } = this.entities
      const { search = '', colletions = [], page = 1, limit = 10, withSvg = false } = query

      // --- Search for the icons using the Iconify API.
      const icons = await Icon.find({
        where: {
          name: search ? ILike(`%${search}%`) : undefined,
          collection: colletions.length > 0 ? In(colletions) : undefined,
        },
        relations: {
          collection: withSvg,
        },
        order: {
          name: 'ASC',
        },
        take: limit,
        skip: (page - 1) * limit,
      })

      // --- Return the icons.
      return icons.map(x => x.serialize(withSvg))
    },
  )
}
