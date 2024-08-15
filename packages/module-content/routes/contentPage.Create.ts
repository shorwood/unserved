import type { ModuleContent } from '../index'
import { ModuleIcon } from '@unserved/module-icon'
import { ModuleLocale } from '@unserved/module-locale'
import { ModuleStorage } from '@unserved/module-storage'
import { ModuleUser } from '@unserved/module-user'
import { createRoute } from '@unserved/server'
import { toSlug } from '@unshared/string'
import { assertNil, assertString, assertStringNotEmpty, assertStringUuid, createArrayParser, createParser } from '@unshared/validation'
import { assertSections } from '../utils'

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
        localeCode: [[assertNil], [assertString]],
        categoryId: [[assertNil], [assertStringUuid]],
        imageId: [[assertNil], [assertStringUuid]],
        bannerId: [[assertNil], [assertStringUuid]],
      }),
    },
    async({ event, body }) => {
      const user = this.getModule(ModuleUser)
      const icon = this.getModule(ModuleIcon)
      const locale = this.getModule(ModuleLocale)
      const storage = this.getModule(ModuleStorage)

      // --- Check if the user has the right permissions.
      await user.a11n(event, { permissions: [this.permissions.PAGE_CREATE.id] })

      // --- Create the website content.
      const { ContentPage, ContentPageContent } = this.entities
      const page = ContentPage.create()
      const content = ContentPageContent.create()
      page.name = body.name
      page.slug = toSlug(body.slug ?? body.name)
      if (body.tags !== undefined) page.tags = await this.resolveTags(body.tags)
      if (body.icon !== undefined) page.icon = await icon.resolveIcon(body.icon)
      if (body.imageId !== undefined) page.image = await storage.resolveFile(body.imageId)
      if (body.bannerId !== undefined) page.banner = await storage.resolveFile(body.bannerId)
      if (body.categoryId !== undefined) page.category = await this.resolveCategory(body.categoryId)

      // --- Create the website content version.
      content.name = page.name
      content.slug = page.slug
      content.sections = body.sections ?? []
      content.description = body.description ?? ''
      content.locale = await locale.resolveLocale(body.localeCode)

      // --- Save the website content.
      await page.save()
      return page.serialize(this)
    },
  )
}
