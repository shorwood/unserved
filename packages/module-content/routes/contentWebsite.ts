import type { ModuleContent } from '../index'
import { ModuleUser } from '@unserved/module-user'
import { createRoute } from '@unserved/server'
import { parseBoolean } from '@unshared/string'
import { assertString, assertUndefined, createSchema } from '@unshared/validation'
import { IsNull, Not } from 'typeorm'

export function contentWebsiteGet(this: ModuleContent) {
  return createRoute(
    {
      name: 'GET /api/website',
      query: createSchema({
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
        permissions: [this.permissions.WEBSITE_READ.id],
      })

      // --- Destructure the query.
      const {
        withIconData = false,
        withImageData = false,
        withBannerData = false,
      } = query

      // --- Fetch the latest published website entity.
      const { ContentWebsite } = this.entities
      const website = await ContentWebsite.findOne({
        where: { createdAt: Not(IsNull()) },
        order: { createdAt: 'DESC' },
        relations: {
          icon: true,
          image: true,
          banner: true,
        },
      })

      // --- Create a new website entity if none exists.
      if (!website) {
        const newWebsite = ContentWebsite.create()
        newWebsite.name = 'Website'
        await newWebsite.save()
        return await newWebsite.serialize(this)
      }

      // --- Return the website entity.
      return await website.serialize(this, {
        withIconData,
        withImageData,
        withBannerData,
      })
    },
  )
}
