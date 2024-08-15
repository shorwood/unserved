import type { StorageFile } from './entities'
import type {
  FileLike,
  StorageDownloadOptions,
  StorageDownloadResult,
  StorageEraseOptions,
  StoragePurgeResult,
  StorageUploadOptions,
} from './utils'
import { ModuleBase } from '@unserved/server'
import * as ENTITIES from './entities'
import * as ROUTES from './routes'
import {
  ERRORS,
  fileToStream,
  PERMISSIONS,
  resolveFile,
  resolveFolder,
  resolveParent,
  resolveParents,
  uploadFromUrl,
} from './utils'

export * from './entities'
export * from './utils/fileToStream'
export * from './utils/types'

export class ModuleStorage extends ModuleBase {
  routes = ROUTES
  errors = ERRORS
  entities = ENTITIES
  permissions = PERMISSIONS

  /**
   * Import data to the S3-Compatible bucket from a remote URL.
   *
   * @param this The `ModuleStorage` instance to use to import the asset.
   * @param url The URL of the data to import to the bucket.
   * @returns The `Asset` entity of the imported data.
   */
  uploadFromUrl = uploadFromUrl.bind(this)

  /**
   * Given an ID, return its `StorageFile` entity. If no ID is provided, throw
   * an error.
   *
   * @param id The ID of the asset file to resolve.
   * @returns The `StorageFile` entity of the resolved asset file.
   */
  resolveFile = resolveFile.bind(this)

  /**
   * Given an asset folder ID, return its `StorageFolder` entity. If no ID is provided,
   * return the existing root folder or create a new one.
   *
   * @param this The `ModuleStorage` instance.
   * @param id The ID of the asset folder to resolve.
   * @returns The `StorageFolder` entity of the resolved asset folder.
   */
  resolveFolder = resolveFolder.bind(this)

  /**
   * Given an `StorageFile` or `StorageFolder` entity, query the database to find the parent of
   * the entity and return it. If the parent is already loaded, return it directly.
   *
   * @param module The module to use to resolve the parent of the entity.
   * @param entity The entity to find the parent of.
   * @returns A promise that resolves to the parent of the entity.
   */
  resolveParent = resolveParent.bind(this)

  /**
   * Given an `StorageFile` or `StorageFolder` entity, query the database to find all the parents of
   * the entity and return them. If the parents are already loaded, return them directly.
   *
   * @param module The module to use to resolve the parents of the entity.
   * @param entity The entity to find the parents of.
   * @returns A promise that resolves to the parents of the entity.
   */
  resolveParents = resolveParents.bind(this)

  /**
   * Transform a `FileLike` object into a stream and derive the hash of the data.
   *
   * @param data The `FileLike` object to transform into a stream.
   * @returns A promise that resolves to the stream and hash of the data.
   */
  fileToStream = fileToStream.bind(this)

  /**
   * Download a `StorageFile` entity from the remote storage and return the data and metadata.
   *
   * @param entity The `StorageFile` entity to download from the remote storage.
   * @param options The options to use to download the file.
   * @returns The data and metadata of the asset.
   */
  // eslint-disable-next-line @typescript-eslint/require-await, @typescript-eslint/no-unused-vars
  async download(entity: StorageFile, options?: StorageDownloadOptions): Promise<StorageDownloadResult> {
    throw new Error('Method not implemented.')
  }

  /**
   * Upload data to the remote storage and create a new `StorageFile` entity.
   *
   * @param fileLike The data to upload to the bucket.
   * @param options The options to use to upload the file.
   * @returns The `StorageFile` entity of the uploaded data.
   */
  // eslint-disable-next-line @typescript-eslint/require-await, @typescript-eslint/no-unused-vars
  async upload(fileLike: FileLike, options?: StorageUploadOptions): Promise<StorageFile> {
    throw new Error('Method not implemented.')
  }

  /**
   * Erase the data from the remote storage and remove the `StorageFile` entity.
   *
   * @param entity The `StorageFile` entity to remove from the remote storage.
   * @param options The options to use to delete the file.
   * @returns A promise that resolves when the file is erased.
   */
  // eslint-disable-next-line @typescript-eslint/require-await, @typescript-eslint/no-unused-vars
  async erase(entity: StorageFile, options?: StorageEraseOptions): Promise<void> {
    throw new Error('Method not implemented.')
  }

  /**
   * Purge all the assets from the remote storage that are not referenced by any entity.
   *
   * @returns A promise that resolves when the storage is purged.
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  async purge(): Promise<StoragePurgeResult> {
    throw new Error('Method not implemented.')
  }

  /**
   * Initialize the remote storage by creating the necessary resources.
   *
   * @returns A promise that resolves when the storage is initialized.
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  async initialize(): Promise<void> {
    throw new Error('Method not implemented.')
  }
}
