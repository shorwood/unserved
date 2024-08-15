import type { StorageDownloadOptions, StorageDownloadResult, StorageFile } from '@unserved/module-storage'
import type { ModuleStorageLocal } from '../index'
import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { join } from 'node:path'

export async function download(this: ModuleStorageLocal, entity: StorageFile, options: StorageDownloadOptions = {}): Promise<StorageDownloadResult> {
  const { offset = 0, size } = options

  // --- Download the data from the disk.
  const filePath = join(this.storageLocalPath, entity.id)
  const fileStat = await stat(filePath).catch(() => {})
  if (!fileStat) throw this.errors.ASSET_FILE_NOT_FOUND(entity.id)

  const stream = () => {
    const stream = createReadStream(filePath, { start: offset, end: size ? offset + size : undefined })
    stream.on('error', () => stream.destroy())
    return stream
  }

  const data = async() => {
    const dataStream = stream()
    const chunks: Buffer[] = []
    for await (const chunk of dataStream) chunks.push(chunk as Buffer)
    const data = Buffer.concat(chunks)
    dataStream.destroy()
    return data
  }

  const text = async() => {
    const buffer = await data()
    return buffer.toString('utf8')
  }

  const base64url = async() => {
    const buffer = await data()
    const url = buffer.toString('base64')
    return `data:${entity.type};base64,${url}`
  }

  // --- Update the download count and return the file.
  entity.downloads++
  await entity.save()
  return {
    data,
    text,
    stream,
    base64url,
    type: entity.type,
    size: entity.size,
  }
}
