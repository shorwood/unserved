import { assertString, assertStringUuid, assertUndefined, createSchema } from '@unshared/validation'
import { parseBoolean } from '@unshared/string'
import { createRoute } from '@unserve/server'
import { ModuleUser } from '@unserve/module-user'
import { ModuleContent } from '../index'

export function contentLanguageGet(this: ModuleContent) {
  return createRoute(
    {
      name: 'GET /api/languages/:id',
      parameters: createSchema({
        id: assertStringUuid,
      }),
      query: createSchema({
        withIconData: [[assertUndefined], [assertString, parseBoolean]],
      }),
    },
    async({ event, parameters, query }) => {

      // --- Check if the user has the right permissions.
      const userModule = this.getModule(ModuleUser)
      await userModule.a11n(event, {
        optional: true,
        permissions: [this.permissions.LANGUAGE_READ.id],
      })

      // --- Destructure the query.
      const { withIconData = false } = query

      // --- Fetch the language.
      const { id } = parameters
      const { ContentLanguage } = this.entities
      const language = await ContentLanguage.findOne({
        where: { id },
        relations: { icon: true },
      })

      if (!language) throw new Error('Language not found.')
      return language.serialize({ withIconData })
    },
  )
}
