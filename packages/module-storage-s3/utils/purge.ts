import { StoragePurgeResult } from '@unserve/module-storage'
import { DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3'
import { ModuleStorageS3 } from '..'

export async function purge(this: ModuleStorageS3): Promise<StoragePurgeResult> {
  const { storageS3bucketName: Bucket } = this
  const { StorageFile } = this.entities
  const result: StoragePurgeResult = { size: 0, count: 0 }

  // --- Get all the assets stored in the bucket.
  const commandList = new ListObjectsV2Command({ Bucket })
  const response = await this.storageS3client.send(commandList)
  if (!response.Contents) return result

  // --- Get all the assets stored in the database.
  const entities = await StorageFile.find({ select: ['id'] })
  const toDelete = new Set<string>()

  // --- Iterate over all the assets in the bucket and mark the ones not in the database for deletion.
  for (const content of response.Contents) {
    if (!content.Key) continue
    const entity = entities.find(x => x.id === content.Key)
    if (entity) continue
    result.count++
    result.size += content.Size ?? 0
    toDelete.add(content.Key)
  }

  // --- Delete all the assets that are not in the database and return the result.
  const promises = [...toDelete].map((Key) => {
    const command = new DeleteObjectCommand({ Key, Bucket })
    return this.storageS3client.send(command)
  })
  await Promise.all(promises)
  return result
}
