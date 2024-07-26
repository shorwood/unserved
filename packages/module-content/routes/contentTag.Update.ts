import { assertString, assertStringUuid, assertUndefined, createParser } from '@unshared/validation'
import { createRoute } from '@unserve/server'
import { ModuleIcon } from '@unserve/module-icon'
import { ModuleContent } from '../index'

export function contentTagUpdate(this: ModuleContent) {
  return createRoute(
    {
      name: 'PUT /api/tags/:id',
      parameters: createParser({
        id: assertStringUuid,
      }),
      body: createParser({
        name: [[assertUndefined], [assertString]],
        icon: [[assertUndefined], [assertString]],
      }),
    },
    async({ parameters, body }) => {
      const iconModule = this.getModule(ModuleIcon)
      const { ContentTag } = this.entities
      const { id } = parameters

      // --- Find the tag and update it.
      const tag = await ContentTag.findOne({ where: { id } })
      if (!tag) throw new Error('Tag not found')
      if (body.name) tag.name = body.name
      if (body.icon) tag.icon = await iconModule.resolveIcon(body.icon)

      // --- Save the tag and return it.
      await tag.save()
      return tag.serialize()
    },
  )
}
