import type { UUID } from 'node:crypto'
import type { ModuleContent } from '../index'
import { ModuleUser } from '@unserved/module-user'
import { createRoute } from '@unserved/server'
import { parseBoolean } from '@unshared/string'
import { assertString, assertStringNotEmpty, assertUndefined, createParser, EXP_UUID } from '@unshared/validation'
import { In } from 'typeorm'

export function contentPageGet(this: ModuleContent) {
  return createRoute(
    {
      name: 'GET /api/pages/:id',
      parameters: createParser({
        id: assertStringNotEmpty,
      }),
      query: createParser({
        category: [[assertUndefined], [assertString]],
        tags: [[assertUndefined], [assertString, (x: string) => x.split(',')]],
        withContent: [[assertUndefined], [assertString, parseBoolean]],
        withSections: [[assertUndefined], [assertString, parseBoolean]],
        withCategory: [[assertUndefined], [assertString, parseBoolean]],
        withIconData: [[assertUndefined], [assertString, parseBoolean]],
        withImageData: [[assertUndefined], [assertString, parseBoolean]],
        withBannerData: [[assertUndefined], [assertString, parseBoolean]],
      }),
    },
    async({ event, parameters, query }) => {
      const userModule = this.getModule(ModuleUser)

      // --- Check if the user has the right permissions.
      await userModule.a11n(event, {
        optional: true,
        permissions: [this.permissions.PAGE_READ.id],
      })

      // --- Destructure the query.
      const {
        tags = [],
        category = '',
        withContent = false,
        withSections = false,
        withIconData = false,
        withCategory = false,
        withImageData = false,
        withBannerData = false,
      } = query

      // --- Fetch the content by its ID.
      const { id } = parameters
      const isUUID = EXP_UUID.test(id)
      const { ContentPage } = this.entities
      const content = await ContentPage.findOne({
        where: {
          id: isUUID ? id as UUID : undefined,
          slug: isUUID ? undefined : id,
          category: category ? { slug: category } : undefined,
          tags: tags.length > 0 ? { slug: In(tags) } : undefined,
        },
        relations: {
          icon: { collection: true },
          tags: true,
          image: true,
          banner: true,
          content: withContent && { locale: true },
          category: withCategory && {
            tags: true,
            image: true,
            banner: true,
            icon: withIconData ? { collection: true } : false,
          },
        },
      })

      // --- Return the website entity.
      if (!content) throw this.errors.CONTENT_PAGE_NOT_FOUND(id)
      return await content.serialize(this, {
        withSections,
        withIconData,
        withImageData,
        withBannerData,
      })
    },
  )
}
