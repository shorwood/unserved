import { assertNumberPositiveStrict, assertString, assertUndefined, createSchema } from '@unshared/validation'
import { createRoute } from '@unserved/server'
import { ModuleSteam } from '../index'

export function steamWorkshopSearch(this: ModuleSteam) {
  return createRoute(
    {
      name: 'GET /api/steam/workshop',
      query: createSchema({
        page: [[assertString, Number.parseInt, assertNumberPositiveStrict], [assertUndefined]],
        limit: [[assertString, Number.parseInt, assertNumberPositiveStrict], [assertUndefined]],
        search: [[assertString], [assertUndefined]],
      }),
    },

    async({ query }) => {
      const { limit = 10, page = 1, search } = query

      // --- Search the Steam Workshop for the Workshop items.
      const items = await this.getWorkshopItems({
        query_type: 0,
        appid: 107410,
        page,
        numperpage: limit,
        search_text: search,
        return_details: true,
        return_short_description: true,
      })

      // --- Format and return the search results.
      return items.map(item => ({
        id: item.publishedfileid,
        name: item.title,
        description: item.short_description,
        files: item.file_url,
        imageUrl: item.preview_url,
        downloads: item.subscriptions,
        revision: item.revision,
        size: Number(item.file_size),
      }))
    },
  )
}
