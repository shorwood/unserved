import { getHeader, setHeader } from 'h3'
import { assertStringUuid, createSchema } from '@unshared/validation'
import { createRoute } from '@unserve/server'
import { ModuleStorage } from '../index'

export function storageFileDownload(this: ModuleStorage) {
  return createRoute(
    {
      name: 'GET /api/storage/:id',
      parameters: createSchema({
        id: assertStringUuid,
      }),
    },
    async({ event, parameters }) => {
      const { id } = parameters
      const { StorageFile } = this.entities

      // --- Get the asset.
      const file = await StorageFile.findOneBy({ id })
      if (!file) throw this.errors.ASSET_FILE_NOT_FOUND(id)

      // --- Download the file.
      const range = getHeader(event, 'Range') ?? ''
      const { start, end } = /bytes=(?<start>\d+)-(?<end>\d+)?/.exec(range)?.groups ?? {}
      const offset = start ? Number.parseInt(start) : 0
      const size = end ? offset + Number.parseInt(end) : undefined
      const data = await this.download(file, { offset, size })

      // --- If an `url` is returned, redirect the user to the URL.
      // if (data.url) return sendRedirect(event, await data.url())

      // --- Otherwise, pipe the data to the response.
      setHeader(event, 'Content-Type', file.type)
      setHeader(event, 'Content-Length', data.size)
      setHeader(event, 'Accept-Ranges', 'bytes')
      return data.stream()
    },
  )
}
