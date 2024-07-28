import { assertBoolean, assertString, assertStringUuid, assertUndefined, createParser } from '@unshared/validation'
import { createRoute } from '@unserved/server'
import { ModuleUser } from '@unserved/module-user'
import { ModuleIcon } from '@unserved/module-icon'
import { ModuleContent } from '../index'

export function contentLanguageUpdate(this: ModuleContent) {
  return createRoute(
    {
      name: 'PUT /api/languages/:id',
      parameters: createParser({
        id: assertStringUuid,
      }),
      body: createParser({
        name: [[assertUndefined], [assertString]],
        code: [[assertUndefined], [assertString]],
        icon: [[assertUndefined], [assertString]],
        isDefault: [[assertBoolean], [assertUndefined]],
        isDisabled: [[assertBoolean], [assertUndefined]],
      }),
    },
    async({ event, parameters, body }) => {
      const iconModule = this.getModule(ModuleIcon)
      const userModule = this.getModule(ModuleUser)

      // --- Check if the user has the right permissions.
      await userModule.a11n(event, { permissions: [this.permissions.LANGUAGE_SEARCH.id] })

      // --- Destructure the parameters and body.
      const { id } = parameters
      const { name, code, icon, isDefault, isDisabled } = body

      // --- Fetch and update the language and update it's properties.
      const { ContentLanguage } = this.entities
      const language = await ContentLanguage.findOne({ where: { id } })
      if (!language) throw new Error('Language not found.')
      if (name) language.name = name
      if (code) language.code = code
      if (icon) language.icon = await iconModule.resolveIcon(icon)
      if (isDefault !== undefined) language.isDefault = isDefault
      if (isDisabled !== undefined) language.isDisabled = isDisabled

      // --- Save and return the language.
      await language.save()
      return language.serialize()
    },
  )
}
