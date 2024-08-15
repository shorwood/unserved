import type { ModuleSteam } from '../index'
import { createRoute } from '@unserved/server'
import { assertString, createSchema } from '@unshared/validation'
import { BBCode } from 'nbbcjs'

const bbCodeParser = new BBCode()
bbCodeParser.setDetectURLs(true)
bbCodeParser.addRule('h1', { simple_start: '<h1>', simple_end: '</h1>' })
bbCodeParser.addRule('h2', { plain_start: '<h2>', plain_end: '</h2>' })
bbCodeParser.addRule('h3', { plain_start: '<h3>', plain_end: '</h3>' })

export function steamWorkshopGet(this: ModuleSteam) {
  return createRoute(
    {
      name: 'GET /api/steam/workshop/:id',
      parameters: createSchema({ id: assertString }),
    },

    async({ parameters }) => {
      const { id } = parameters

      // --- Search the Steam Workshop for the Workshop items.
      const item = await this.getWorkshopItemDetails({
        appid: 107410,
        publishedfileids: [id],
        includeadditionalpreviews: true,
        includetags: true,
        includechildren: true,
        includeforsaledata: true,
        includekvtags: true,
        includemetadata: true,
        includereactions: true,
        includevotes: true,
      })

      const images = item.previews
        ?.filter(x => x.preview_type === 0)
        .map(x => x.url!)
        .filter(Boolean)

      // --- Format and return the search results.
      return {
        id: item.publishedfileid,
        name: item.title,
        size: Number(item.file_size),
        description: bbCodeParser.parse(item.file_description),
        imageUrl: item.preview_url,
        subscriptions: item.subscriptions,
        createdAt: new Date(item.time_created * 1000).toISOString(),
        updatedAt: new Date(item.time_updated * 1000).toISOString(),
        tags: item.tags.map(tag => tag.display_name),
        images: images ?? [item.preview_url],
      }
    },
  )
}
