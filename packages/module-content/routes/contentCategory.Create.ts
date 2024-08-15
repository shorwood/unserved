import type { ModuleContent } from '../index'
import { ModuleIcon } from '@unserved/module-icon'
import { ModuleStorage } from '@unserved/module-storage'
import { ModuleUser } from '@unserved/module-user'
import { createRoute } from '@unserved/server'
import { toSlug } from '@unshared/string'
import { assertString, assertStringNotEmpty, assertStringUuid, assertUndefined, createArrayParser, createParser } from '@unshared/validation'

export function contentCategoryCreate(this: ModuleContent) {
  return createRoute(
    {
      name: 'POST /api/categories',
      body: createParser({
        name: assertString,
        icon: [[assertUndefined], [assertString]],
        slug: [[assertUndefined], [assertString]],
        tags: [[assertUndefined], [createArrayParser(assertStringNotEmpty)]],
        description: [[assertUndefined], [assertString]],
        imageId: [[assertUndefined], [assertStringUuid]],
        bannerId: [[assertUndefined], [assertStringUuid]],
      }),
    },
    async({ event, body }) => {
      const iconModule = this.getModule(ModuleIcon)
      const assetModule = this.getModule(ModuleStorage)
      const userModule = this.getModule(ModuleUser)

      // --- Check if the user has the right permissions.
      await userModule.a11n(event, { permissions: [this.permissions.CATEGORY_CREATE.id] })

      // --- Create and save the category.
      const { ContentCategory } = this.entities
      const category = ContentCategory.create()
      category.name = body.name
      category.slug = toSlug(body.slug ?? body.name)
      category.description = body.description ?? ''
      if (body.tags !== undefined) category.tags = await this.resolveTags(body.tags)
      if (body.icon !== undefined) category.icon = await iconModule.resolveIcon(body.icon)
      if (body.imageId !== undefined) category.image = await assetModule.resolveFile(body.imageId)
      if (body.bannerId !== undefined) category.banner = await assetModule.resolveFile(body.bannerId)

      // --- Save the category.
      await category.save()
      return category.serialize(this)
    },
  )
}
