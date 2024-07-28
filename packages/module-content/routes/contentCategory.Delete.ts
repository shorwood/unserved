import { assertStringUuid, createParser } from '@unshared/validation'
import { createRoute } from '@unserved/server'
import { ModuleUser } from '@unserved/module-user'
import { ModuleContent } from '../index'

export function contentCategoryDelete(this: ModuleContent) {
  return createRoute(
    {
      name: 'DELETE /api/categories/:id',
      parameters: createParser({
        id: assertStringUuid,
      }),
    },
    async({ event, parameters }) => {

      // --- Check if the user has the right permissions.
      const userModule = this.getModule(ModuleUser)
      await userModule.a11n(event, { permissions: [this.permissions.CATEGORY_DELETE.id] })

      // --- Fetch the category by its ID.
      const { id } = parameters
      const { ContentCategory } = this.entities
      const category = await ContentCategory.findOne({ where: { id } })

      // --- Delete the category.
      if (!category) throw new Error('Category not found')
      await category.remove()
      return category.serialize(this)
    },
  )
}
