import type { ModuleLocale } from '../index'
import { ModuleIcon } from '@unserved/module-icon'
import { ModuleUser } from '@unserved/module-user'
import { createRoute } from '@unserved/server'
import { assertBoolean, assertString, assertUndefined, createParser } from '@unshared/validation'
import { setResponseStatus } from 'h3'

export function localeCreate(this: ModuleLocale) {
  return createRoute(
    {
      name: 'POST /api/locale',
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
      await userModule.a11n(event, { permissions: [this.permissions.LOCALE_WRITE.id] })

      // --- Destructure the body.
      const {
        name,
        code,
        icon,
        isDefault = false,
        isDisabled = false,
      } = body

      // --- Check if it's the first locale.
      const { Locale } = this.entities
      const count = await Locale.count()

      // --- Create a new language entity.
      const locale = Locale.create()
      locale.name = name
      locale.code = code
      locale.isDefault = isDefault || count === 0
      locale.isDisabled = isDisabled
      locale.icon = await iconModule.resolveIcon(icon)

      // --- Save and return the language.
      await locale.save()
      setResponseStatus(event, 201)
    },
  )
}
