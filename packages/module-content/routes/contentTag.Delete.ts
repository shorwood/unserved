import { setResponseStatus } from 'h3'
import { assertStringUuid, createParser } from '@unshared/validation'
import { createRoute } from '@unserved/server'
import { ModuleContent } from '../index'

export function contentTagDelete(this: ModuleContent) {
  return createRoute(
    {
      name: 'DELETE /api/tags/:id',
      parameters: createParser({
        id: assertStringUuid,
      }),
    },
    async({ event, parameters }) => {
      const { ContentTag } = this.entities
      const { id } = parameters
      const tag = await ContentTag.findOne({ where: { id } })
      if (!tag) throw new Error('Tag not found')
      await tag.softRemove()
      setResponseStatus(event, 204)
    },
  )
}
