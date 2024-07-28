import { StorageEraseOptions, StorageFile } from '@unserved/module-storage'
import { ModuleStorageAzure } from '../index'

export async function erase(this: ModuleStorageAzure, entity: StorageFile, options: StorageEraseOptions = {}): Promise<void> {
  const { force = false, ...deleteObjectOptions } = options

  // --- If the asset is referenced more than once, do not delete it
  // --- unless the `force` flag is set to `true`. Also, update the
  // --- `references` count and return the asset.
  if (entity.references > 1 && !force) {
    entity.references--
    await entity.save()
    return
  }

  // --- Delete the data from the Azure Blob storage.
  const containerClient = this.storageAzureClient.getContainerClient(this.storageAzureContainerName!)
  const blockBlobClient = containerClient.getBlockBlobClient(entity.id)
  await blockBlobClient.delete()

  // --- Remove the entity from the database.
  await entity.remove(deleteObjectOptions)
}
