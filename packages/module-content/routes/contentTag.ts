import type { ModuleContent } from '../index'
import { createRoute } from '@unserved/server'
import { assertStringUuid, createParser } from '@unshared/validation'

export function contentTagGet(this: ModuleContent) {
  return createRoute(
    {
      name: 'GET /api/tags/:id',
      parameters: createParser({
        id: assertStringUuid,
      }),
    },
    async({ parameters }) => {
      const { ContentTag } = this.entities
      const { id } = parameters

      const tag = await ContentTag.findOne({ where: { id } })
      if (!tag) throw new Error('Tag not found')
      return tag.serialize()
    },
  )
}
