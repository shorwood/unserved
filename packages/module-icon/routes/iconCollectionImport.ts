import { assertStringNotEmpty, createParser } from '@unshared/validation'
import { createRoute } from '@unserve/server'
import { ModuleUser } from '@unserve/module-user'
import { IconCollectionDownload, IconCollectionMetadata } from '../utils'
import { ModuleIcon } from '../index'

interface Progress {
  value: number
  message: string
}

export function iconCollectionImport(this: ModuleIcon) {
  return createRoute(
    {
      name: 'POST /api/icons/collections/:name',
      parameters: createParser({
        name: [assertStringNotEmpty],
      }),
    },
    async({ event, parameters }) => {
      const { IconCollection, Icon } = this.entities
      const { name } = parameters

      // --- Assert permissions.
      const userModule = this.getModule(ModuleUser)
      await userModule.a11n(event, { permissions: [this.permissions.COLLECTION_IMPORT.id] })

      // --- Import the icon collection.
      const eventId = `icon.collection.import.${name}`
      return this.withEventStream<Progress>(eventId, event, async(stream) => {
        await this.withTransaction(async() => {

          // --- Check if the icon collection already exists.
          const exists = await IconCollection.findOne({ where: { slug: name } })
          if (exists) this.errors.ICON_COLLECTION_ALREADY_EXISTS(name)

          // --- Fetch the icon collection from the Iconify API.
          await stream.send({ value: 0, message: 'Downloading icon collection...' })
          const collectionUrl = new URL(`@iconify-json/${name}/icons.json`, this.iconCdn)
          const collectionResponse = await fetch(collectionUrl)
          if (!collectionResponse.ok) this.errors.ICONIFY_IMPORT_FAILED(collectionResponse)
          const collectionData = await collectionResponse.json() as IconCollectionDownload

          // --- Fetch the icon collection from the Iconify API.
          const url = new URL(`/collections?prefix=${name}`, this.iconIconifyUrl)
          const response = await fetch(url)
          if (!response.ok) this.errors.ICONIFY_FETCH_FAILED(response)
          const data = await response.json() as Record<string, IconCollectionMetadata>
          const collectionMetadata = data[name]

          // --- Create the icon collection entity.
          const collection = new IconCollection()
          collection.slug = collectionData.prefix
          collection.name = collectionMetadata.name
          collection.width = collectionData.width ?? 24
          collection.height = collectionData.height ?? 24
          collection.metadata = collectionMetadata
          collection.icons = []

          // --- For each icon, store it in the database.
          let index = 0
          const total = Object.keys(collectionData.icons).length
          for (const iconName in collectionData.icons) {

            // --- Update the task message every 10 icons.
            await stream.send({
              value: index / total,
              message: `Importing icons ${index++}/${total}...`,
            })
            await new Promise(resolve => setTimeout(resolve, 1))

            const icon = Icon.create()
            icon.name = `${collection.slug}:${iconName}`
            icon.isSample = collectionMetadata.samples.includes(iconName)
            icon.body = collectionData.icons[iconName].body
            icon.collection = collection
            collection.icons.push(icon)
          }

          // --- Wait for all the icons to be stored.
          await collection.save()
        })
      })
    },
  )
}
