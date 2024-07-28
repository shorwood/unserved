import { assertNil, assertString, assertStringNotEmpty, assertStringUuid, createArrayParser, createParser } from '@unshared/validation'
import { toSlug } from '@unshared/string'
import { createRoute } from '@unserved/server'
import { ModuleUser } from '@unserved/module-user'
import { ModuleStorage } from '@unserved/module-storage'
import { ModuleIcon } from '@unserved/module-icon'
import { assertSections } from '../utils'
import { ModuleContent } from '../index'

export function contentPageCreate(this: ModuleContent) {
  return createRoute(
    {
      name: 'POST /api/pages',
      body: createParser({
        name: assertStringNotEmpty,
        icon: [[assertNil], [assertString]],
        slug: [[assertNil], [assertString]],
        tags: [[assertNil], [createArrayParser(assertStringNotEmpty)]],
        sections: [[assertNil], [assertSections]],
        description: [[assertNil], [assertString]],
        languageCode: [[assertNil], [assertString]],
        categoryId: [[assertNil], [assertStringUuid]],
        imageId: [[assertNil], [assertStringUuid]],
        bannerId: [[assertNil], [assertStringUuid]],
      }),
    },
    async({ event, body }) => {
      const iconModule = this.getModule(ModuleIcon)
      const assetModule = this.getModule(ModuleStorage)
      const userModule = this.getModule(ModuleUser)

      // --- Check if the user has the right permissions.
      await userModule.a11n(event, { permissions: [this.permissions.PAGE_CREATE.id] })

      // --- Create the website content.
      const { ContentPage, ContentPageContent } = this.entities
      const page = ContentPage.create()
      const content = ContentPageContent.create()
      page.name = body.name
      page.slug = toSlug(body.slug ?? body.name)
      if (body.tags !== undefined) page.tags = await this.resolveTags(body.tags)
      if (body.icon !== undefined) page.icon = await iconModule.resolveIcon(body.icon)
      if (body.imageId !== undefined) page.image = await assetModule.resolveFile(body.imageId)
      if (body.bannerId !== undefined) page.banner = await assetModule.resolveFile(body.bannerId)
      if (body.categoryId !== undefined) page.category = await this.resolveCategory(body.categoryId)

      // --- Create the website content version.
      content.name = page.name
      content.slug = page.slug
      content.sections = body.sections ?? []
      content.description = body.description ?? ''
      content.language = await this.resolveLanguage(body.languageCode)

      // --- Save the website content.
      await page.save()
      return page.serialize(this)
    },
  )
}
