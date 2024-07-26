import { ILike } from 'typeorm'
import { assertString, assertStringNumber, assertUndefined, createParser } from '@unshared/validation'
import { parseBoolean } from '@unshared/string'
import { createRoute } from '@unserve/server'
import { ModuleUser } from '@unserve/module-user'
import { IconCollectionMetadata } from '../utils'
import { IconCollectionObject, ModuleIcon } from '..'

export function iconCollectionSearch(this: ModuleIcon) {
  return createRoute(
    {
      name: 'GET /api/icons/collections',
      query: createParser({
        search: [[assertUndefined], [assertString]],
        page: [[assertUndefined], [assertStringNumber, Number.parseInt]],
        limit: [[assertUndefined], [assertStringNumber, Number.parseInt]],
        remote: [[assertUndefined], [assertString, parseBoolean]],
      }),
    },
    async({ event, query }): Promise<IconCollectionObject[]> => {

      // --- Assert permissions.
      const userModule = this.getModule(ModuleUser)
      await userModule.a11n(event, { permissions: [this.permissions.COLLECTION_SEARCH.id] })

      const { IconCollection } = this.entities
      const { search = '', page = 1, limit = 10, remote } = query

      // --- Fetch the icon collections from the Iconify API.
      if (remote) {
        const url = new URL('collections', this.iconIconifyUrl)
        const response = await fetch(url)
        if (!response.ok) this.errors.ICONIFY_FETCH_FAILED(response)
        const data = await response.json() as Record<string, IconCollectionMetadata>

        // --- Fetch the local icon collections from the database.
        // --- Also, check if and mark the collections that are installed.
        const collections = await IconCollection.find({ select: ['slug'] })
        return Object.entries(data)
          .filter(([slug, collection]) => slug.includes(search) || collection.name.includes(search))
          .map(([slug, collection]) => ({ slug, isInstalled: collections.some(s => s.slug === slug), ...collection }))
          .sort((a, b) => a.slug.localeCompare(b.slug))
          .slice((page - 1) * limit, page * limit)
      }

      // --- Fetch the local icon collections from the database.
      const searchOperator = search ? ILike(`%${search}%`) : undefined
      const collections = await IconCollection.find({
        where: search
          ? [{ slug: searchOperator }, { name: searchOperator }]
          : {},
        relations: {
          icons: true,
        },
        take: limit,
        skip: (page - 1) * limit,
      })

      // --- Return the serialized icon collections.
      return collections.map(x => x.serialize())
    },
  )
}
