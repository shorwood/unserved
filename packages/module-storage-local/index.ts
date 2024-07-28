import { ModuleStorage } from '@unserved/module-storage'
import { download, erase, initialize, purge, upload } from './utils'

export type ModuleStorageLocalOptions = Partial<Pick<
  ModuleStorageLocal,
  'storageLocalPath'
>>

export class ModuleStorageLocal extends ModuleStorage {
  constructor(options: ModuleStorageLocalOptions = {}) {
    super()
    if (options.storageLocalPath) this.storageLocalPath = options.storageLocalPath
  }

  /**
   * The path to the directory where the assets are stored on the local filesystem.
   * This is used as a fallback when the S3 client is not available.
   *
   * @default process.env.STORAGE_LOCAL_PATH
   */
  storageLocalPath = process.env.STORAGE_LOCAL_PATH ?? '.data/storage'

  /**
   * Purge the storage by deleting all the files from the local filesystem that are not referenced
   * by any `StorageFile` entity in the database.
   *
   * @returns A promise that resolves when the storage is purged.
   */
  purge = purge.bind(this)

  /**
   * Erase the data from the local filesystem and remove the `StorageFile` entity.
   *
   * @param this The `ModuleStorageLocal` instance to use to erase the asset.
   * @param entity The file to erase from the disk.
   * @param options The options to use to erase the file.
   * @returns A promise that resolves when the file is erased.
   */
  erase = erase.bind(this)

  /**
   * Upload data to the local filesystem and create a new `StorageFile` entity.
   *
   * @param this The `ModuleStorageLocal` instance to use to upload the asset.
   * @param fileLike The data to upload to the bucket.
   * @returns The `StorageFile` entity of the uploaded data.
   */
  upload = upload.bind(this)

  /**
   * Download data from the local filesystem and return the data and metadata of the file.
   *
   * @param this The `ModuleStorageLocal` instance to use to download the file.
   * @param storageFile The file to download from the disk.
   * @param options The options to use to download the file.
   * @returns The data and metadata of the file.
   */
  download = download.bind(this)

  /**
   * Initialize the local directory that will be used to store the assets.
   *
   * @throws An error if the local directory could not be created.
   * @returns A promise that resolves when the local directory is created.
   */
  initialize = initialize.bind(this)
}
