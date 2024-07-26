import { assertBoolean, assertString, assertUndefined, createParser } from '@unshared/validation'
import { createRoute } from '@unserve/server'
import { ModuleUser } from '@unserve/module-user'
import { ModuleIcon } from '@unserve/module-icon'
import { ModuleContent } from '../index'

export function contentLanguageCreate(this: ModuleContent) {
  return createRoute(
    {
      name: 'POST /api/languages',
      body: createParser({
        name: assertString,
        code: assertString,
        icon: [[assertUndefined], [assertString]],
        isDefault: [[assertUndefined], [assertBoolean]],
        isDisabled: [[assertUndefined], [assertBoolean]],
      }),
    },
    async({ event, body }) => {
      const iconModule = this.getModule(ModuleIcon)
      const userModule = this.getModule(ModuleUser)

      // --- Check if the user has the right permissions.
      await userModule.a11n(event, { permissions: [this.permissions.LANGUAGE_CREATE.id] })

      // --- Destructure the body.
      const {
        name,
        code,
        icon,
        isDefault = false,
        isDisabled = false,
      } = body

      // --- Create a new language entity.
      const { ContentLanguage } = this.entities
      const language = ContentLanguage.create()
      language.name = name
      language.code = code
      language.isDefault = isDefault
      language.isDisabled = isDisabled
      language.icon = await iconModule.resolveIcon(icon)

      // --- Save and return the language.
      await language.save()
      return language.serialize()
    },
  )
}
