import { assertString, assertStringNotEmpty, assertStringUuid, assertUndefined, createArrayParser, createParser } from '@unshared/validation'
import { toSlug } from '@unshared/string'
import { createRoute } from '@unserve/server'
import { ModuleUser } from '@unserve/module-user'
import { ModuleStorage } from '@unserve/module-storage'
import { ModuleIcon } from '@unserve/module-icon'
import { ModuleContent } from '../index'

export function contentCategoryUpdate(this: ModuleContent) {
  return createRoute(
    {
      name: 'PUT /api/categories/:id',
      parameters: createParser({
        id: assertStringUuid,
      }),
      body: createParser({
        name: [[assertUndefined], [assertString]],
        icon: [[assertUndefined], [assertString]],
        slug: [[assertUndefined], [assertString]],
        tags: [[assertUndefined], [createArrayParser(assertStringNotEmpty)]],
        description: [[assertUndefined], [assertString]],
        imageId: [[assertUndefined], [assertStringUuid]],
        bannerId: [[assertUndefined], [assertStringUuid]],
      }),
    },
    async({ event, parameters, body }) => {
      const iconModule = this.getModule(ModuleIcon)
      const assetModule = this.getModule(ModuleStorage)
      const userModule = this.getModule(ModuleUser)

      // --- Check if the user has the right permissions.
      await userModule.a11n(event, { permissions: [this.permissions.CATEGORY_UPDATE.id] })

      // --- Fetch the category.
      const { id } = parameters
      const { ContentCategory } = this.entities
      const category = await ContentCategory.findOne({
        where: { id },
        relations: {
          tags: true,
          image: true,
          banner: true,
        },
      })

      // --- Update the category.
      if (!category) throw new Error('Category not found.')
      if (body.name) category.name = body.name
      if (body.slug) category.slug = toSlug(body.slug)
      if (body.description) category.description = body.description
      if (body.tags !== undefined) category.tags = await this.resolveTags(body.tags)
      if (body.icon !== undefined) category.icon = await iconModule.resolveIcon(body.icon)
      if (body.imageId !== undefined) category.image = await assetModule.resolveFile(body.imageId)
      if (body.bannerId !== undefined) category.banner = await assetModule.resolveFile(body.bannerId)

      // --- Save the category and return it.
      await category.save()
      return category.serialize(this)
    },
  )
}
