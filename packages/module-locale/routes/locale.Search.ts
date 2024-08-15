import type { ModuleLocale } from '../index'
import { ModuleUser } from '@unserved/module-user'
import { createRoute } from '@unserved/server'
import { parseBoolean } from '@unshared/string'
import { assertString, assertStringNumber, assertUndefined, createParser } from '@unshared/validation'
import { ILike } from 'typeorm'

export function localeSearch(this: ModuleLocale) {
  return createRoute(
    {
      name: 'GET /api/locale',
      query: createParser({
        search: [[assertString], [assertUndefined]],
        page: [[assertUndefined], [assertStringNumber, Number.parseInt]],
        limit: [[assertUndefined], [assertStringNumber, Number.parseInt]],
        withIcon: [[assertUndefined], [assertString, parseBoolean]],
        withCount: [[assertUndefined], [assertString, parseBoolean]],
        withIconData: [[assertUndefined], [assertString, parseBoolean]],
      }),
    },
    async({ event, query }) => {
      const userModule = this.getModule(ModuleUser)
      await userModule.a11n(event, { permissions: [this.permissions.LOCALE_READ.id] })

      // --- Destructure the query.
      const {
        search,
        page = 1,
        limit = 10,
        withIcon = false,
        withCount = false,
        withIconData = false,
      } = query

      // --- Fetch all locales matching the search.
      const { Locale } = this.entities
      const locales = await Locale.find({
        where: [
          { name: search ? ILike(`%${search}%`) : undefined },
          { code: search ? ILike(`%${search}%`) : undefined },
        ],
        relations: {
          icon: withIcon ? { collection: withIconData } : false,
          translations: withCount,
        },
        order: {
          isDefault: 'DESC',
          name: 'ASC',
        },
        take: limit,
        skip: (page - 1) * limit,
      })

      // --- Return the locales.
      return locales.map(locale => locale.serialize({ withIconData, withCount }))
    },
  )
}
