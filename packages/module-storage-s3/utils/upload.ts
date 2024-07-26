import { FileLike, StorageFile, fileToStream } from '@unserve/module-storage'
import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { ModuleStorageS3 } from '..'

export async function upload(this: ModuleStorageS3, file: FileLike): Promise<StorageFile> {
  const { StorageFile } = this.entities

  // --- Extract the stream from the `FileLike` object, derive the hash
  // --- and conditionally convert the stream from a web stream to a node stream.
  const { stream, hash } = await fileToStream(file)

  // --- Create the metadata for the file.
  const entity = StorageFile.create()
  const command = new PutObjectCommand({
    ACL: 'private',
    Body: stream,
    Key: entity.id,
    Bucket: this.storageS3bucketName,
    ContentType: file.type,
    ContentLength: file.size,
    ContentDisposition: `inline; filename="${file.name}"`,
    Metadata: { Name: file.name },
  })

  // --- Send the command to the S3 client.
  const response = await this.storageS3client.send(command)
  if (!response.ETag) throw new Error('Could not upload the file to the S3 bucket')

  // --- Once the data is uploaded, assert it is not duplicated, if so, delete the data
  // --- and update the `references` count, and return the existing entity.
  const hashValue = await hash.then(hash => hash.digest('hex'))
  const existingAsset = await StorageFile.findOneBy({ hash: hashValue })
  if (existingAsset) {
    const command = new DeleteObjectCommand({ Key: entity.id, Bucket: this.storageS3bucketName })
    await this.storageS3client.send(command)
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
