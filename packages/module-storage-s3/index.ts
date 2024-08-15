import type { S3Client } from '@aws-sdk/client-s3'
import { ModuleStorage } from '@unserved/module-storage'
import { download, erase, initialize, purge, upload } from './utils'

export type ModuleStorageS3Options = Partial<Pick<
  ModuleStorageS3,
  'storageS3bucketAccessKey'
  | 'storageS3bucketCreate'
  | 'storageS3bucketEndpoint'
  | 'storageS3bucketName'
  | 'storageS3bucketRegion'
  | 'storageS3bucketSecretKey'
  | 'storageS3client'
>>

export class ModuleStorageS3 extends ModuleStorage {
  constructor(options: ModuleStorageS3Options = {}) {
    super()
    if (options.storageS3client) this.storageS3client = options.storageS3client
    if (options.storageS3bucketName) this.storageS3bucketName = options.storageS3bucketName
    if (options.storageS3bucketRegion) this.storageS3bucketRegion = options.storageS3bucketRegion
    if (options.storageS3bucketCreate) this.storageS3bucketCreate = options.storageS3bucketCreate
    if (options.storageS3bucketEndpoint) this.storageS3bucketEndpoint = options.storageS3bucketEndpoint
    if (options.storageS3bucketAccessKey) this.storageS3bucketAccessKey = options.storageS3bucketAccessKey
    if (options.storageS3bucketSecretKey) this.storageS3bucketSecretKey = options.storageS3bucketSecretKey
  }

  /** The S3 client used to interact with the S3-Compatible bucket. */
  storageS3client: S3Client

  /**
   * The name of the S3-Compatible bucket where the assets are stored.
   *
   * @default process.env.STORAGE_S3_BUCKET_NAME
   * @example 'my-bucket'
   */
  storageS3bucketName = process.env.STORAGE_S3_BUCKET_NAME

  /**
   * The region of the S3-Compatible bucket where the assets are stored.
   *
   * @default process.env.STORAGE_S3_BUCKET_REGION
   */
  storageS3bucketRegion = process.env.STORAGE_S3_BUCKET_REGION

  /**
   * The endpoint of the S3-Compatible bucket where the assets are stored.
   *
   * @default process.env.STORAGE_S3_BUCKET_ENDPOINT
   * @example 'https://my-bucket.s3.amazonaws.com'
   */
  storageS3bucketEndpoint = process.env.STORAGE_S3_BUCKET_ENDPOINT

  /**
   * The access key of the S3-Compatible bucket where the assets are stored.
   * This key should have read access to the bucket.
   *
   * @default process.env.STORAGE_S3_BUCKET_ACCESS_KEY
   */
  storageS3bucketAccessKey = process.env.STORAGE_S3_BUCKET_ACCESS_KEY

  /**
   * The secret key of the S3-Compatible bucket where the assets are stored.
   * This key should have read access to the bucket.
   *
   * @default process.env.STORAGE_S3_BUCKET_SECRET
   */
  storageS3bucketSecretKey = process.env.STORAGE_S3_BUCKET_SECRET_KEY

  /**
   * If `true`, the bucket is created if it does not exist when the module is initialized.
   * If `false`, an error is thrown if the bucket does not exist.
   *
   * @default false
   */
  storageS3bucketCreate = false

  /**
   * Set up the S3-Compatible client and check if it can connect to the bucket.
   * Once the client is set up, it can be used to upload, download, and erase assets.
   * This method is called automatically when the module is initialized.
   *
   * @throws An error if the S3 client cannot connect to the bucket.
   * @returns A promise that resolves when the S3 client is set up.
   */
  initialize = initialize.bind(this)

  /**
   * Upload data to the S3-Compatible bucket.
   *
   * @param file The data to upload to the bucket.
   * @returns The `Asset` entity of the uploaded data.
   */
  upload = upload.bind(this)

  /**
   * Download data from the S3-Compatible bucket.
   *
   * @param this The `ModuleStorage` instance to use to download the file.
   * @param entity The file to download from the bucket.
   * @param options The options to use to download the file.
   * @returns The data and metadata of the file.
   */
  download = download.bind(this)

  /**
   * Erase the data from the S3-Compatible bucket and remove the `StorageFile` entity.
   *
   * @param entity The `StorageFile` entity to remove from the S3-Compatible bucket.
   * @param options The options to use to delete the file.
   * @returns A promise that resolves when the file is deleted.
   */
  erase = erase.bind(this)

  /**
   * Purge all the assets not stored in the database from the S3-Compatible bucket.
   * This clears up the stale files that are not referenced in the database and are
   * taking up space in the bucket without any use.
   *
   * @returns A promise that resolves with the number of assets deleted and the assets removed.
   */
  purge = purge.bind(this)
}
