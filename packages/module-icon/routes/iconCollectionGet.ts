import { assertString, assertStringNotEmpty, assertUndefined, createParser } from '@unshared/validation'
import { parseBoolean } from '@unshared/string'
import { createRoute } from '@unserve/server'
import { ModuleUser } from '@unserve/module-user'
import { IconCollectionMetadata } from '../utils'
import { IconCollectionObject, ModuleIcon } from '..'

export function iconCollectionGet(this: ModuleIcon) {
  return createRoute(
    {
      name: 'GET /api/icons/collections/:name',
      parameters: createParser({
        name: [assertStringNotEmpty],
      }),
      query: createParser({
        remote: [[assertUndefined], [assertString, parseBoolean]],
      }),
    },
    async({ event, parameters, query }): Promise<IconCollectionObject> => {
      const { name } = parameters
      const { remote } = query

      // --- Assert permissions.
      const userModule = this.getModule(ModuleUser)
      await userModule.a11n(event, { permissions: [this.permissions.COLLECTION_GET.id] })

      // --- Fetch the icon collection from the database.
      const { IconCollection } = this.entities
      const collection = await IconCollection.findOne({ where: { slug: name } })
      if (collection) return collection.serialize()

      // --- Throw an error if the collection is not found and not remote.
      if (!remote) throw this.errors.ICON_COLLECTION_NOT_FOUND(name)

      // --- Fetch the collection set from the Iconify API.
      const url = new URL(`collections?prefix=${name}`, this.iconIconifyUrl)
      const response = await fetch(url)
      if (!response.ok) this.errors.ICONIFY_FETCH_FAILED(response)
      const data = await response.json() as Record<string, IconCollectionMetadata>
      const collectionRemote = data[name]
      if (!collectionRemote) throw this.errors.ICON_COLLECTION_NOT_FOUND(name)
      return {
        ...collectionRemote,
        slug: name,
        isInstalled: false,
      }
    },
  )
}
