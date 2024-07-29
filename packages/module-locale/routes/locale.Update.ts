import { setResponseStatus } from 'h3'
import { assertBoolean, assertString, assertStringUuid, assertUndefined, createParser } from '@unshared/validation'
import { createRoute } from '@unserved/server'
import { ModuleUser } from '@unserved/module-user'
import { ModuleIcon } from '@unserved/module-icon'
import { ModuleLocale } from '../index'

export function localeUpdate(this: ModuleLocale) {
  return createRoute(
    {
      name: 'PUT /api/locale/:id',
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
      await userModule.a11n(event, { permissions: [this.permissions.LOCALE_WRITE.id] })

      // --- Destructure the parameters and body.
      const { id } = parameters
      const { name, code, icon, isDefault, isDisabled } = body

      // --- Fetch and update the locale and update it's properties.
      const { Locale } = this.entities
      const locale = await Locale.findOneBy({ id })
      if (!locale) throw this.errors.LOCALE_NOT_FOUND(id)

      // --- Update the locale.
      if (name) locale.name = name
      if (code) locale.code = code
      if (icon) locale.icon = await iconModule.resolveIcon(icon)
      if (isDefault !== undefined) locale.isDefault = isDefault
      if (isDisabled !== undefined) locale.isDisabled = isDisabled

      // --- Save and return the locale.
      await locale.save()
      setResponseStatus(event, 204)
    },
  )
}
