import type { StoragePurgeResult } from '@unserved/module-storage'
import type { ModuleStorageLocal } from '../index'
import { readdir, rm, stat } from 'node:fs/promises'
import { join } from 'node:path'

export async function purge(this: ModuleStorageLocal): Promise<StoragePurgeResult> {
  const entities = await this.entities.StorageFile.find({ select: ['id'] })
  const files = await readdir(this.storageLocalPath, { withFileTypes: true })

  // --- Create the result object
  const result: StoragePurgeResult = { size: 0, count: 0 }
  const toDelete = new Set<string>()

  // --- Iterate over all the files in the storage and delete the ones not referenced.
  for (const file of files) {
    if (!file.isFile()) continue
    const entity = entities.find(asset => asset.id === file.name)
    if (entity) continue

    // --- If the asset is not referenced, delete it from the disk.
    const filePath = join(this.storageLocalPath, file.name)
    const fileStat = await stat(filePath)
    result.size += fileStat.size
    result.count++
    toDelete.add(filePath)
  }

  // --- Delete all the files that are not referenced and return the result.
  const promises = [...toDelete].map(filePath => rm(filePath, { force: true }))
  await Promise.all(promises)
  return result
}
