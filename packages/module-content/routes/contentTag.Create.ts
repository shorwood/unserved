import type { ModuleContent } from '../index'
import { createRoute } from '@unserved/server'
import { toSlug } from '@unshared/string'
import { assertString, createParser } from '@unshared/validation'

export function contentTagCreate(this: ModuleContent) {
  return createRoute(
    {
      name: 'POST /api/tags',
      body: createParser({
        name: assertString,
      }),
    },
    async({ body }) => {
      const { ContentTag } = this.entities
      const tag = ContentTag.create()
      tag.name = body.name
      tag.slug = toSlug(body.name)
      await tag.save()
      return tag.serialize()
    },
  )
}
