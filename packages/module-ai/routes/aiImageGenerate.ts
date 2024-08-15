import type { StorageFile, StorageFileObject } from '@unserved/module-storage'
import type { ModuleAI } from '../index'
import type { OpenAI_ImageGenerateResponse } from '../utils'
import { ModuleStorage } from '@unserved/module-storage'
import { ModuleUser } from '@unserved/module-user'
import { createRoute } from '@unserved/server'
import { dedent } from '@unshared/string'
import { assertStringNotEmpty, assertStringUuid, assertUndefined, createAssertStringEnum, createParser } from '@unshared/validation'

export function aiImageGenerate(this: ModuleAI) {
  return createRoute(
    {
      name: 'POST /api/ai/image',
      body: createParser({
        prompt: assertStringNotEmpty,
        model: [[assertUndefined], [createAssertStringEnum(['dall-e-2', 'dall-e-3'])]],
        size: [[assertUndefined], [createAssertStringEnum(['1024x1024', '1024x1792', '1792x1024'])]],
        style: [[assertUndefined], [createAssertStringEnum(['vivid', 'natural'])]],
        parentId: [[assertUndefined], [assertStringUuid]],
      }),
    },
    async({ event, body }): Promise<StorageFileObject[]> => {
      const userModle = this.getModule(ModuleUser)
      const assetModule = this.getModule(ModuleStorage)

      // --- Assert permissions.
      await userModle.a11n(event, { permissions: [this.permissions.IMAGE_GENERATE.id] })

      // --- Decompose the input.
      const { prompt, size = '1024x1024', model = 'dall-e-3', style = 'vivid', parentId } = body

      // --- Check if the OpenAI API key and URL are set.
      if (!this.aiOpenaiKey) throw this.errors.AI_OPENAI_KEY_NOT_SET()
      if (!this.aiOpenaiUrl) throw this.errors.AI_OPENAI_URL_NOT_SET()

      // --- Generate an image generation prompt from the input.
      const imagePrompt = await this.openaiComplete({
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
        messages: prompt,
        maxTokens: 512,
        model: 'gpt-4o',
      })

      // --- Generate the image using the OpenAI API.
      const url = new URL('v1/images/generations', this.aiOpenaiUrl)
      const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify({
          prompt: imagePrompt,
          size,
          model,
          style,
          n: 1,
        }),
        headers: {
          'Authorization': `Bearer ${this.aiOpenaiKey}`,
          'Content-Type': 'application/json',
        },
      })

      // --- Check if the request was successful.
      if (!response.ok) throw await this.errors.AI_OPENAI_ERROR(response)
      const data = await response.json() as OpenAI_ImageGenerateResponse

      // --- Fetch and store the generated image.
      const files: StorageFile[] = []
      for (const { url } of data.data) {
        const now = Date.now()
        const name = `${model} - ${now}`
        const file = await assetModule.uploadFromUrl(url, { name, parentId, description: imagePrompt })
        files.push(file)
      }

      // --- Return the generated image.
      return files.map(x => x.serialize())
    },
  )
}
