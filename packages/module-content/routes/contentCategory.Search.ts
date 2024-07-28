import { ILike, In } from 'typeorm'
import { assertString, assertStringNumber, assertUndefined, createParser } from '@unshared/validation'
import { parseBoolean } from '@unshared/string'
import { createRoute } from '@unserved/server'
import { ModuleUser } from '@unserved/module-user'
import { ModuleContent } from '../index'

export function contentCategoryList(this: ModuleContent) {
  return createRoute(
    {
      name: 'GET /api/categories',
      query: createParser({
        page: [[assertUndefined], [assertStringNumber, Number.parseInt]],
        limit: [[assertUndefined], [assertStringNumber, Number.parseInt]],
        search: [[assertUndefined], [assertString]],
        tags: [[assertUndefined], [assertString, (value: string) => value.split(',')]],
        withPages: [[assertUndefined], [assertString, parseBoolean]],
        withCategory: [[assertUndefined], [assertString, parseBoolean]],
        withIconData: [[assertUndefined], [assertString, parseBoolean]],
        withImageData: [[assertUndefined], [assertString, parseBoolean]],
        withBannerData: [[assertUndefined], [assertString, parseBoolean]],
      }),
    },
    async({ event, query }) => {

      // --- Check if the user has the right permissions.
      const userModule = this.getModule(ModuleUser)
      await userModule.a11n(event, {
        optional: true,
        permissions: [this.permissions.CATEGORY_SEARCH.id],
      })

      // --- Desctructure the query.
      const {
        search,
        tags = [],
        page = 1,
        limit = 10,
        withPages = false,
        withCategory = false,
        withIconData = false,
        withImageData = false,
        withBannerData = false,
      } = query

      // --- Fetch the categories.
      const { ContentCategory } = this.entities
      const categories = await ContentCategory.find({
        where: [
          {
            name: search ? ILike(`%${search}%`) : undefined,
            tags: tags.length > 0 ? { slug: In(tags) } : undefined,
          },
          {
            slug: search ? ILike(`%${search}%`) : undefined,
            tags: tags.length > 0 ? { slug: In(tags) } : undefined,
          },
        ],
        relations: {
          tags: true,
          image: true,
          banner: true,
          icon: { collection: withIconData },
          pages: withPages
            ? {
              tags: true,
              image: true,
              banner: true,
              content: true,
              category: withCategory,
              icon: { collection: withIconData },
            }
            : false,
        },
        order: {
          createdAt: 'DESC',
          tags: { createdAt: 'DESC' },
        },
        take: limit,
        skip: (page - 1) * limit,
      })

      // --- Return the website entity.
      return Promise.all(categories.map(category =>
        category.serialize(this, {
          withIconData,
          withImageData,
          withBannerData,
        })))
    },
  )
}
