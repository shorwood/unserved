import type { ModuleContent } from '../index'
import { createRoute } from '@unserved/server'
import { assertString, assertUndefined, createParser } from '@unshared/validation'
import { ILike } from 'typeorm'

export function contentTagList(this: ModuleContent) {
  return createRoute(
    {
      name: 'GET /api/tags',
      query: createParser({
        search: [[assertString], [assertUndefined]],
      }),
    },
    async({ query }) => {
      const { ContentTag } = this.entities
      const { search } = query

      // --- Fetch all tags.
      const tags = await ContentTag.find({
        where: search
          ? [
            { name: ILike(`%${search}%`) },
            { slug: ILike(`%${search}%`) },
          ]
          : {},
      })

      // --- Return the tags.
      return tags.map(tag => tag.serialize())
    },
  )
}
