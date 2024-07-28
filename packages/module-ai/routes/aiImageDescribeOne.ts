import Sharp from 'sharp'
import { assertStringUuid, assertUndefined, createAssertStringEnum, createParser } from '@unshared/validation'
import { dedent } from '@unshared/string'
import { createRoute } from '@unserved/server'
import { ModuleUser } from '@unserved/module-user'
import { ModuleStorage, StorageFileObject } from '@unserved/module-storage'
import { ModuleAI } from '../index'

export function aiImageDescribeOne(this: ModuleAI) {
  return createRoute(
    {
      name: 'POST /api/ai/image/describe',
      body: createParser({
        model: [[assertUndefined], [createAssertStringEnum(['gpt-4o'])]],
        fileId: assertStringUuid,
      }),
    },
    async({ event, body }): Promise<StorageFileObject> => {

      // --- Assert permissions.
      const userModule = this.getModule(ModuleUser)
      await userModule.a11n(event, { permissions: [this.permissions.IMAGE_DESCRIBE.id] })

      // --- Decompose the input.
      const { fileId, model = 'gpt-4o' } = body

      // --- Query the file from the database.
      const assetModule = this.getModule(ModuleStorage)
      const { StorageFile } = assetModule.entities
      const file = await StorageFile.findOneBy({ id: fileId })

      // --- Assert the file exists and is an image.
      if (!file) throw assetModule.errors.ASSET_FILE_NOT_FOUND(fileId)
      if (!file.type.startsWith('image/'))
        throw this.errors.AI_GENERATE_DESCRIPTION_FILE_NOT_IMAGE(fileId)

      // --- Fetch the data of the image.
      const imageData = await file.download(this)
      const imageBuffer = await imageData.data()
      const imageJpeg = await Sharp(imageBuffer)
        .resize({ background: '#ffffff', width: 1024, height: 1024, fit: 'contain' })
        .jpeg({ quality: 80 })
        .toBuffer()

      // --- Describe the image using the OpenAI API.
      file.description = await this.openaiComplete({
        model,
        maxTokens: 2048,
        system: dedent(`
          Create a very detailed description based on the following image.
          Make one paragraph for each of the following:

          - The general style of the image. (e.g. "A surrealistic image, boxy and abstract, flat-design")
          - The shadows and lighting of the image. (e.g. "The image is well-lit with soft shadows, no shadows")
          - The shapes and forms of the image. (e.g. "The image is composed of geometric shapes and abstract forms")
          - The color palette of the image. (e.g. "The image is composed of warm colors and pastel tones")
          - The depth of the colors and the contrast. (e.g. "The colors are vibrant and the contrast is high")
          - The perspective of the image. (e.g. "The image is a top-down view, 2d, isometric")
          - The color and background of the image. (e.g. "The cat is black and the forest is green")
          - The positionning of the elements in the image. (e.g. "The cat is in the center of the image")
          - Any other relevant information about the image.
          - The content of the image. (e.g. "A cat in a forest")
        `),
        messages: {
          type: 'image_url',
          image_url: { url: `data:image/jpeg;base64,${imageJpeg.toString('base64')}` },
        },
      })

      // --- Set the description of the file and save it.
      await file.save()
      return file.serialize()
    },
  )
}
