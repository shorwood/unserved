import { ModuleStorage } from '@unserve/module-storage'
import { BlobServiceClient, ContainerClient } from '@azure/storage-blob'
import { download, erase, initialize, upload } from './utils'

export type ModuleStorageAzureOptions = Partial<Pick<
  ModuleStorageAzure,
  'storageAzureClient'
  | 'storageAzureConnectionString'
  | 'storageAzureContainerName'
>>

export class ModuleStorageAzure extends ModuleStorage {
  constructor(options: ModuleStorageAzureOptions = {}) {
    super()
    if (options.storageAzureClient) this.storageAzureClient = options.storageAzureClient
    if (options.storageAzureContainerName) this.storageAzureContainerName = options.storageAzureContainerName
    if (options.storageAzureConnectionString) this.storageAzureConnectionString = options.storageAzureConnectionString
  }

  /**
   * The `BlobServiceClient` used to interact with the Azure Blob storage. If
   * the client is not provided, it is created using the connection string.
   */
  storageAzureClient: BlobServiceClient

  /**
   * The `ContainerClient` used to interact with the Azure Blob storage container.
   * if the client is not provided, it is created using the container name.
   */
  storageAzureContainer: ContainerClient

  /**
   * The container name in the Azure Blob storage where the data is stored.
   *
   * @default process.env.STORAGE_AZURE_CONTAINER_NAME
   */
  storageAzureContainerName = process.env.STORAGE_AZURE_CONTAINER_NAME

  /**
   * The storage account connection string used to connect to the Azure Blob storage.
   *
   * @default process.env.STORAGE_AZURE_CONNECTION_STRING
   */
  storageAzureConnectionString = process.env.STORAGE_AZURE_CONNECTION_STRING

  /**
   * Set up the Azure Blob client and check if it can connect to the storage account.
   *
   * @throws An error if the Azure Blob client could not be created.
   * @returns A promise that resolves when the Azure Blob client is created.
   */
  initialize = initialize.bind(this)

  /**
   * Upload data to the Azure Blob storage and create a new `StorageFile` entity.
   *
   * @param file The data to upload to the bucket.
   * @returns The `StorageFile` entity of the uploaded data.
   */
  upload = upload.bind(this)

  /**
   * Download data from the Azure Blob storage and return the data and metadata.
   *
   * @param entity The `StorageFile` entity to download from the Azure Blob storage.
   * @param options The options to use to download the file.
   * @returns The data and metadata of the asset.
   */
  download = download.bind(this)

  /**
   * Erase the data from the Azure Blob storage and remove the `StorageFile` entity.
   *
   * @param entity The `StorageFile` entity to remove.
   * @param options The options to use to delete the file.
   * @returns A promise that resolves when the file is erased.
   */
  erase = erase.bind(this)

  /**
   * Purge all the assets not stored in the database from the Azure Blob storage.
   * This clears up the stale files that are not referenced in the database and are
   * taking up space in the bucket without any use.
   *
   * @returns A promise that resolves with the number of assets deleted and the assets removed.
   */
  // purge = purge.bind(this)
}
