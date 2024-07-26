import { assertNil, assertString, assertStringUuid, createParser } from '@unshared/validation'
import { toSlug } from '@unshared/string'
import { createRoute } from '@unserve/server'
import { ModuleUser } from '@unserve/module-user'
import { ModuleStorage } from '@unserve/module-storage'
import { ModuleIcon } from '@unserve/module-icon'
import { assertFields } from '../utils'
import { ModuleForm } from '../index'

export function formUpdate(this: ModuleForm) {
  return createRoute(
    {
      name: 'PUT /api/forms/:id',
      parameters: createParser({
        id: assertStringUuid,
      }),
      body: createParser({
        name: [[assertNil], [assertString]],
        slug: [[assertNil], [assertString]],
        icon: [[assertNil], [assertString]],
        imageId: [[assertNil], [assertStringUuid]],
        bannerId: [[assertNil], [assertStringUuid]],
        description: [[assertNil], [assertString]],
        fields: [[assertNil], [assertFields]],
      }),
    },
    async({ event, parameters, body }) => {
      const assetModule = this.getModule(ModuleStorage)
      const iconModule = this.getModule(ModuleIcon)
      const userModule = this.getModule(ModuleUser)

      // --- Check if the user has the right permissions.
      await userModule.a11n(event, { permissions: [this.permissions.FORM_SEARCH.id] })

      // --- Fetch the form.
      const { id } = parameters
      const { Form } = this.entities
      const form = await Form.findOne({ where: { id } })
      if (!form) throw this.errors.E_FORM_NOT_FOUND(id)

      // --- Update the form.
      if (body.name) form.name = body.name
      if (body.slug) form.slug = toSlug(body.slug)
      if (body.fields) form.fields = body.fields
      if (body.description) form.description = body.description
      if (body.imageId !== undefined) form.image = await assetModule.resolveFile(body.imageId)
      if (body.bannerId !== undefined) form.banner = await assetModule.resolveFile(body.bannerId)
      if (body.icon !== undefined) form.icon = await iconModule.resolveIcon(body.icon)

      // --- Save the form.
      await form.save()
      return await form.serialize(this)
    },
  )
}
