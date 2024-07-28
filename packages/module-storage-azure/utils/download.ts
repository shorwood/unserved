import { Readable } from 'node:stream'
import { StorageDownloadOptions, StorageDownloadResult, StorageFile } from '@unserved/module-storage'
import { BlobSASPermissions } from '@azure/storage-blob'
import { ModuleStorageAzure } from '../index'

export async function download(this: ModuleStorageAzure, entity: StorageFile, options: StorageDownloadOptions = {}): Promise<StorageDownloadResult> {
  const { offset, size, abortSignal } = options

  // --- Download the data from the Azure Blob storage.
  const blockBlobClient = this.storageAzureContainer.getBlockBlobClient(entity.id)
  const response = await blockBlobClient.download(offset, size, { abortSignal })
  if (!response.readableStreamBody) throw this.errors.ASSET_REMOTE_DOWNLOAD_FAILED(entity.id)

  // --- Extract the data and metadata from the response.
  const stream = () => {
    const stream = response.readableStreamBody!
    return Readable.from(stream)
  }

  const data = () => {
    const stream = response.readableStreamBody!
    return new Promise<Buffer>((resolve, reject) => {
      const chunks: Uint8Array[] = []
      stream.on('data', (chunk: Uint8Array) => chunks.push(chunk))
      stream.on('end', () => resolve(Buffer.concat(chunks)))
      stream.on('error', reject)
    })
  }

  const text = async() => {
    const buffer = await data()
    return buffer.toString('utf8')
  }

  const base64url = async() => {
    const buffer = await data()
    const url = buffer.toString('base64')
    return `data:${response.contentType};base64,${url}`
  }

  const url = async() => {
    const permissions = BlobSASPermissions.parse('r')
    return blockBlobClient.generateSasUrl({
      contentType: response.contentType,
      permissions,
      startsOn: new Date(),
      expiresOn: new Date(Date.now() + 3600 * 1000),
    })
  }

  return {
    url,
    text,
    data,
    base64url,
    stream,
    size: response.contentLength!,
    type: response.contentType!,
  }
}
