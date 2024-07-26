import { join } from 'node:path'
import { rm } from 'node:fs/promises'
import { createWriteStream } from 'node:fs'
import { FileLike, StorageFile, fileToStream } from '@unserve/module-storage'
import { ModuleStorageLocal } from '../index'

export async function upload(this: ModuleStorageLocal, entity: FileLike): Promise<StorageFile> {
  const { StorageFile } = this.entities

  // --- Extract the stream from the `FileLike` object, derive the hash
  // --- and conditionally convert the stream from a web stream to a node stream.
  const { stream, hash } = await fileToStream(entity.stream)

  // --- Create the metadata for the asset.
  const file = StorageFile.create()
  const filePath = join(this.storageLocalPath, file.id)
  const writeStream = createWriteStream(filePath)
  stream.pipe(writeStream)

  // --- Wait for the stream to finish writing the data to the local filesystem.
  await new Promise((resolve, reject) => {
    writeStream.on('finish', resolve)
    writeStream.on('error', reject)
  })

  // --- Once the asset is uploaded, assert it is not duplicated, if so, delete local asset
  // --- and update the `references` count, and return the existing asset.
  const hashValue = await hash.then(hash => hash.digest('hex'))
  const existingAsset = await StorageFile.findOneBy({ hash: hashValue })
  if (existingAsset) {
    await rm(filePath, { force: true })
    existingAsset.references++
    return await existingAsset.save()
  }

  // --- Otherwise, save the asset to the database and return it.
  file.name = entity.name
  file.type = entity.type
  file.size = entity.size
  file.hash = hashValue
  file.parent = await this.resolveFolder(entity.parentId)
  file.description = entity.description ?? ''
  return await file.save()
}
