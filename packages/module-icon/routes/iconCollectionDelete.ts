import { setResponseStatus } from 'h3'
import { assertStringNotEmpty, createParser } from '@unshared/validation'
import { createRoute } from '@unserved/server'
import { ModuleIcon } from '../index'

export function iconCollectionDelete(this: ModuleIcon) {
  return createRoute(
    {
      name: 'DELETE /api/icons/collections/:name',
      parameters: createParser({
        name: [assertStringNotEmpty],
      }),
    },
    async({ event, parameters }) => {
      const { IconCollection } = this.entities
      const { name } = parameters

      // --- Fetch the icon set from the database.
      const collection = await IconCollection.findOne({
        where: { slug: name },
        relations: { icons: true },
      },
      )

      // --- Erase the icon set.
      if (!collection) throw this.errors.ICON_COLLECTION_NOT_FOUND(name)
      await collection.remove()
      setResponseStatus(event, 204)
    },
  )
}
