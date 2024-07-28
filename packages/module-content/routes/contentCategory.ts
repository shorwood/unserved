import { assertString, assertStringUuid, assertUndefined, createParser } from '@unshared/validation'
import { parseBoolean } from '@unshared/string'
import { createRoute } from '@unserved/server'
import { ModuleUser } from '@unserved/module-user'
import { ModuleContent } from '../index'

export function contentCategoryGet(this: ModuleContent) {
  return createRoute(
    {
      name: 'GET /api/categories/:id',
      parameters: createParser({
        id: assertStringUuid,
      }),
      query: createParser({
        withTags: [[assertUndefined], [assertString, parseBoolean]],
        withPages: [[assertUndefined], [assertString, parseBoolean]],
        withIconData: [[assertUndefined], [assertString, parseBoolean]],
        withImageData: [[assertUndefined], [assertString, parseBoolean]],
        withBannerData: [[assertUndefined], [assertString, parseBoolean]],
      }),
    },
    async({ event, parameters, query }) => {

      // --- Check if the user has the right permissions.
      const userModule = this.getModule(ModuleUser)
      await userModule.a11n(event, {
        optional: true,
        permissions: [this.permissions.CATEGORY_READ.id],
      })

      // --- Destructure the query.
      const {
        withTags = false,
        withPages = false,
        withIconData = false,
        withImageData = false,
        withBannerData = false,
      } = query

      // --- Fetch the category.
      const { id } = parameters
      const { ContentCategory } = this.entities
      const category = await ContentCategory.findOne({
        where: { id },
        relations: {
          image: true,
          banner: true,
          tags: withTags,
          pages: withPages,
          icon: { collection: withImageData },
        },
      })

      // --- Return the website entity.
      if (!category) throw new Error('Category not found.')
      return await category.serialize(this, {
        withIconData,
        withImageData,
        withBannerData,
      })
    },
  )
}
