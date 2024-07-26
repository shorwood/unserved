import { ILike, In } from 'typeorm'
import { assertString, assertStringNumber, assertUndefined, createParser } from '@unshared/validation'
import { parseBoolean } from '@unshared/string'
import { createRoute } from '@unserve/server'
import { ModuleUser } from '@unserve/module-user'
import { ModuleContent } from '../index'

export function contentPageList(this: ModuleContent) {
  return createRoute(
    {
      name: 'GET /api/pages',
      query: createParser({
        search: [[assertUndefined], [assertString]],
        tags: [[assertUndefined], [assertString, (value: string) => value.split(',')]],
        page: [[assertUndefined], [assertStringNumber, Number.parseInt]],
        limit: [[assertUndefined], [assertStringNumber, Number.parseInt]],
        withContent: [[assertUndefined], [assertString, parseBoolean]],
        withSections: [[assertUndefined], [assertString, parseBoolean]],
        withCategory: [[assertUndefined], [assertString, parseBoolean]],
        withIconData: [[assertUndefined], [assertString, parseBoolean]],
        withImageData: [[assertUndefined], [assertString, parseBoolean]],
        withBannerData: [[assertUndefined], [assertString, parseBoolean]],
      }),
    },
    async({ event, query }) => {
      const userModule = this.getModule(ModuleUser)

      // --- Check if the user has the right permissions.
      await userModule.a11n(event, {
        optional: true,
        permissions: [this.permissions.PAGE_SEARCH.id],
      })

      // --- Destructure the query.
      const {
        search,
        tags = [],
        page = 1,
        limit = 10,
        withContent = false,
        withSections = false,
        withCategory = false,
        withIconData = false,
        withImageData = false,
        withBannerData = false,
      } = query

      // --- Fetch the content matching the search query.
      const { ContentPage } = this.entities
      const contents = await ContentPage.find({
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
          content: withContent,
          category: withCategory,
          icon: { collection: true },
        },
        order: { createdAt: 'DESC' },
        take: limit,
        skip: (page - 1) * limit,
      })

      // --- Return the website entity.
      return Promise.all(contents.map(content =>
        content.serialize(this, {
          withSections,
          withIconData,
          withImageData,
          withBannerData,
        }),
      ))
    },
  )
}
