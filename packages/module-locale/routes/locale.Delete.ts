import type { ModuleLocale } from '../index'
import { ModuleUser } from '@unserved/module-user'
import { createRoute } from '@unserved/server'
import { assertStringUuid, createSchema } from '@unshared/validation'
import { setResponseStatus } from 'h3'

export function localeDelete(this: ModuleLocale) {
  return createRoute(
    {
      name: 'DELETE /api/locale/:id',
      parameters: createSchema({
        id: assertStringUuid,
      }),
    },
    async({ event, parameters }) => {
      const userModule = this.getModule(ModuleUser)
      await userModule.a11n(event, { permissions: [this.permissions.LOCALE_DELETE.id] })

      // --- Destructure the parameters.
      const { Locale } = this.entities
      const { id } = parameters

      // --- Fetch and soft remove the locale.
      const locale = await Locale.findOneBy({ id })
      if (!locale) throw this.errors.LOCALE_NOT_FOUND(id)
      await locale.softRemove()
      setResponseStatus(event, 204)
    },
  )
}
