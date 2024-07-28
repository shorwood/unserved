import { Like } from 'typeorm'
import { assertString, assertStringNumber, assertUndefined, createParser } from '@unshared/validation'
import { parseBoolean } from '@unshared/string'
import { createRoute } from '@unserved/server'
import { ModuleUser } from '@unserved/module-user'
import { ModuleContent } from '../index'

export function contentLanguageSearch(this: ModuleContent) {
  return createRoute(
    {
      name: 'GET /api/languages',
      query: createParser({
        search: [[assertString], [assertUndefined]],
        page: [[assertUndefined], [assertStringNumber, Number.parseInt]],
        limit: [[assertUndefined], [assertStringNumber, Number.parseInt]],
        withIconData: [[assertUndefined], [assertString, parseBoolean]],
      }),
    },
    async({ event, query }) => {
      const userModule = this.getModule(ModuleUser)

      // --- Check if the user has the right permissions.
      await userModule.a11n(event, {
        optional: true,
        permissions: [this.permissions.LANGUAGE_SEARCH.id],
      })

      // --- Destructure the query.
      const {
        search,
        limit = 10,
        page = 1,
        withIconData = false,
      } = query

      // --- Fetch all languages matching the search.
      const { ContentLanguage } = this.entities
      const languages = await ContentLanguage.find({
        where: {
          name: search ? Like(`%${search}%`) : undefined,
        },
        relations: {
          icon: { collection: withIconData },
        },
        order: {
          isDefault: 'DESC',
          name: 'ASC',
        },
        take: limit,
        skip: (page - 1) * limit,
      })

      // --- Return the languages.
      return languages.map(language => language.serialize({
        withIconData,
      }))
    },
  )
}
