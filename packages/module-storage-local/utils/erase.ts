import { join } from 'node:path'
import { rm } from 'node:fs/promises'
import { StorageEraseOptions, StorageFile } from '@unserve/module-storage'
import { ModuleStorageLocal } from '../index'

export async function erase(this: ModuleStorageLocal, entity: StorageFile, options: StorageEraseOptions = {}): Promise<void> {
  const { force = false, ...deleteObjectOptions } = options

  // --- If the asset is referenced more than once, do not delete it
  // --- unless the `force` flag is set to `true`. Also, update the
  // --- `references` count and return the asset.
  if (entity.references > 1 && !force) {
    entity.references--
    await entity.save()
    return
  }

  // --- Delete the data from the disk.
  const assetPath = join(this.storageLocalPath, entity.id)
  await rm(assetPath, { force: true })
  await entity.remove(deleteObjectOptions)
}
