import { assertString, createParser } from '@unshared/validation'
import { toSlug } from '@unshared/string'
import { createRoute } from '@unserve/server'
import { ModuleContent } from '../index'

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
