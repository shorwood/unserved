import { setResponseStatus } from 'h3'
import { assertStringUuid, createParser } from '@unshared/validation'
import { createRoute } from '@unserved/server'
import { ModuleUser } from '@unserved/module-user'
import { ModuleContent } from '../index'

export function contentLanguageDelete(this: ModuleContent) {
  return createRoute(
    {
      name: 'DELETE /api/languages/:id',
      parameters: createParser({
        id: assertStringUuid,
      }),
    },
    async({ event, parameters }) => {
      const userModule = this.getModule(ModuleUser)

      // --- Check if the user has the right permissions.
      await userModule.a11n(event, { permissions: [this.permissions.LANGUAGE_DELETE.id] })

      // --- Fetch and delete the language.
      const { id } = parameters
      const { ContentLanguage } = this.entities
      const language = await ContentLanguage.findOne({ where: { id } })
      if (!language) throw this.errors.CONTENT_LANGUAGE_NOT_FOUND(id)
      await language.softRemove()
      setResponseStatus(event, 204)
    },
  )
}
