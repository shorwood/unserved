import type { ModuleLocale } from '../index'
import { ModuleUser } from '@unserved/module-user'
import { createRoute } from '@unserved/server'
import { parseBoolean } from '@unshared/string'
import { assertString, assertStringNotEmpty, assertUndefined, createSchema, EXP_UUID } from '@unshared/validation'
import { ILike } from 'typeorm'

export function localeGet(this: ModuleLocale) {
  return createRoute(
    {
      name: 'GET /api/locale/:idOrCode',
      parameters: createSchema({
        idOrCode: assertStringNotEmpty,
      }),
      query: createSchema({
        key: [[assertUndefined], [assertString]],
        withIcon: [[assertUndefined], [assertString, parseBoolean]],
        withCount: [[assertUndefined], [assertString, parseBoolean]],
        withIconData: [[assertUndefined], [assertString, parseBoolean]],
        withStringtable: [[assertUndefined], [assertString, parseBoolean]],
      }),
    },
    async({ event, parameters, query }) => {
      const userModule = this.getModule(ModuleUser)
      await userModule.a11n(event, { permissions: [this.permissions.LOCALE_READ.id] })

      // --- Destructure entities, parameters, and query.
      const { Locale } = this.entities
      const { idOrCode } = parameters
      const {
        key = '%',
        withIcon = false,
        withCount = false,
        withIconData = false,
        withStringtable = false,
      } = query

      // --- Fetch the locale.
      const isUUID = EXP_UUID.test(idOrCode)
      const locale = await Locale.findOne({
        where: {
          [isUUID ? 'id' : 'code']: idOrCode,
          translations: key ? { key: ILike(key) } : undefined,
        },
        relations: {
          icon: withIcon ? { collection: withIconData } : false,
          translations: withStringtable,
        },
        order: {
          translations: 'ASC',
        },
      })

      // --- Throw an error if the locale is not found.
      if (!locale) throw this.errors.LOCALE_NOT_FOUND(idOrCode)
      return locale.serialize({ withIconData, withCount, withStringtable })
    },
  )
}
