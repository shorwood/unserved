import { FileLike, StorageFile, fileToStream } from '@unserve/module-storage'
import { ModuleStorageAzure } from '../index'

export async function upload(this: ModuleStorageAzure, file: FileLike): Promise<StorageFile> {
  const { storageAzureContainerName: container } = this
  if (!container) throw new Error('The Azure Blob container name is required.')

  // --- Extract the stream from the `FileLike` object, derive the hash
  // --- and conditionally convert the stream from a web stream to a node stream.
  const { stream, hash } = await fileToStream(file)

  // --- Upload the data to the Azure Blob storage.
  const entity = StorageFile.create()
  const containerClient = this.storageAzureClient.getContainerClient(container)
  const blockBlobClient = containerClient.getBlockBlobClient(entity.id)
  await blockBlobClient.uploadStream(stream, file.size, 5, {
    blobHTTPHeaders: {
      blobContentType: file.type,
      blobContentDisposition: `inline; filename="${file.name}"`,
    },
  })

  // --- Once the data is uploaded, assert it is not duplicated, if so, delete the data
  // --- and update the `references` count, and return the existing entity.
  const hashValue = await hash.then(hash => hash.digest('hex'))
  const existingAsset = await StorageFile.findOneBy({ hash: hashValue })
  if (existingAsset) {
    await blockBlobClient.delete()
    existingAsset.references++
    return await existingAsset.save()
  }

  // --- Save the entity to the database and return it.
  entity.name = file.name
  entity.type = file.type
  entity.size = file.size
  entity.hash = hashValue
  entity.parent = await this.resolveFolder(file.parentId)
  entity.description = file.description ?? ''
  return await entity.save()
}
