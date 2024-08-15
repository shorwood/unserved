import type { ModuleContent } from '../index'
import { ModuleUser } from '@unserved/module-user'
import { createRoute } from '@unserved/server'
import { assertStringUuid, createParser } from '@unshared/validation'
import { setResponseStatus } from 'h3'

export function contentPageDelete(this: ModuleContent) {
  return createRoute(
    {
      name: 'DELETE /api/pages/:id',
      parameters: createParser({
        id: assertStringUuid,
      }),
    },
    async({ event, parameters }) => {
      const user = this.getModule(ModuleUser)
      await user.a11n(event, { permissions: [this.permissions.PAGE_DELETE.id] })

      // --- Delete the website content.
      const { id } = parameters
      const { ContentPage } = this.entities
      const page = await ContentPage.findOne({ where: { id } })
      if (!page) throw new Error('Website content not found')

      // --- Soft delete the website content. Also prepend the slug with
      // --- "DELETED-" and append the current date to avoid conflicts.
      await this.withTransaction(async() => {
        const date = new Date().toISOString()
        page.slug = `${page.slug}_${date}`
        await page.save()
        await page.softRemove()
      })

      // --- Set the response status to 204 No Content.
      setResponseStatus(event, 204)
    },
  )
}
