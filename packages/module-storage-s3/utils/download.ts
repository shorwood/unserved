import type { StorageDownloadOptions, StorageDownloadResult, StorageFile } from '@unserved/module-storage'
import type { ReadableStream } from 'node:stream/web'
import type { ModuleStorageS3 } from '../index'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { Readable } from 'node:stream'

export async function download(this: ModuleStorageS3, entity: StorageFile, options: StorageDownloadOptions = {}): Promise<StorageDownloadResult> {
  const { offset = 0, size } = options

  // --- Determine the range of the data to download based on the offset and size.
  let range
  if (size && offset) range = `bytes=${offset}-${offset + size}`
  if (size && !offset) range = `bytes=0-${size}`
  if (!size && offset) range = `bytes=${offset}-`

  // --- Download the data from the bucket.
  const command = new GetObjectCommand({
    Key: entity.id,
    Bucket: this.storageS3bucketName,
    Range: range,
  })

  // --- Send the command to the S3 client.
  const response = await this.storageS3client.send(command)
  if (!response.Body) throw this.errors.ASSET_FILE_NOT_FOUND(entity.id)
  const body = response.Body

  const stream = () => {
    const stream = body.transformToWebStream()
    return Readable.from(stream as ReadableStream)
  }

  const data = async() => {
    const bytes = await body.transformToByteArray()
    return Buffer.from(bytes)
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
    type: response.ContentType!,
    size: response.ContentLength!,
    data,
    text,
    stream,
    base64url,
  }
}
