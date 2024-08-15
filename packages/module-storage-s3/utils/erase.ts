import type { StorageEraseOptions, StorageFile } from '@unserved/module-storage'
import type { ModuleStorageS3 } from '../index'
import { DeleteObjectCommand } from '@aws-sdk/client-s3'

export async function erase(this: ModuleStorageS3, entity: StorageFile, options: StorageEraseOptions = {}): Promise<void> {
  const { force = false, ...deleteObjectOptions } = options

  // --- If the asset is referenced more than once, do not delete it
  // --- unless the `force` flag is set to `true`. Also, update the
  // --- `references` count and return the asset.
  if (entity.references > 1 && !force) {
    entity.references--
    await entity.save()
    return
  }

  // --- Delete the data from the bucket.
  const command = new DeleteObjectCommand({
    Key: entity.id,
    Bucket: this.storageS3bucketName,
  })

  // --- Send the command to the S3 client first so if it fails, the asset is not removed
  // --- from the database and the operation can be retried later.
  await this.storageS3client.send(command)
  await entity.remove(deleteObjectOptions)
}
