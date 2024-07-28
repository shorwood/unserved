import { assertNil, assertString, assertStringUuid, createSchema } from '@unshared/validation'
import { toSlug } from '@unshared/string'
import { createRoute } from '@unserved/server'
import { ModuleUser } from '@unserved/module-user'
import { ModuleStorage } from '@unserved/module-storage'
import { ModuleIcon } from '@unserved/module-icon'
import { assertFields } from '../utils'
import { ModuleForm } from '../index'

export function formCreate(this: ModuleForm) {
  return createRoute(
    {
      name: 'POST /api/forms',
      body: createSchema({
        name: assertString,
        slug: [[assertNil], [assertString]],
        icon: [[assertNil], [assertString]],
        imageId: [[assertNil], [assertStringUuid]],
        bannerId: [[assertNil], [assertStringUuid]],
        description: [[assertNil], [assertString]],
        fields: [[assertNil], [assertFields]],
      }),
    },
    async({ event, body }) => {
      const iconModule = this.getModule(ModuleIcon)
      const assetModule = this.getModule(ModuleStorage)
      const { Form } = this.entities

      // --- Check if the user has the right permissions.
      const userModule = this.getModule(ModuleUser)
      await userModule.a11n(event, { permissions: [this.permissions.FORM_CREATE.id] })

      // --- Create and save the form.
      const form = Form.create()
      form.name = body.name
      form.fields = body.fields ?? []
      form.slug = toSlug(body.slug ?? body.name)
      if (body.icon) form.icon = await iconModule.resolveIcon(body.icon)
      if (body.imageId) form.image = await assetModule.resolveFile(body.imageId)
      if (body.bannerId) form.banner = await assetModule.resolveFile(body.bannerId)
      if (body.description) form.description = body.description

      // --- Save the form.
      await form.save()
      return await form.serialize(this)
    },
  )
}
