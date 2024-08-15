import type { ModuleStorageS3 } from '../index'
import { CreateBucketCommand, ListBucketsCommand, S3Client } from '@aws-sdk/client-s3'
import { dedent } from '@unshared/string'

export async function initialize(this: ModuleStorageS3): Promise<void> {
  if (this.storageS3client instanceof S3Client) return

  // --- Assert that the required options are provided.
  if (!this.storageS3bucketName) throw new Error('The bucket name is required to connect to the S3-Compatible bucket.')
  if (!this.storageS3bucketRegion) throw new Error('The bucket region is required to connect to the S3-Compatible bucket.')
  if (!this.storageS3bucketAccessKey) throw new Error('The bucket access key is required to connect to the S3-Compatible bucket.')
  if (!this.storageS3bucketSecretKey) throw new Error('The bucket secret key is required to connect to the S3-Compatible bucket.')

  // --- Create the S3 client with the provided options.
  this.storageS3client = this.storageS3client ?? new S3Client({
    credentials: {
      accessKeyId: this.storageS3bucketAccessKey,
      secretAccessKey: this.storageS3bucketSecretKey,
    },
    region: this.storageS3bucketRegion,
    endpoint: this.storageS3bucketEndpoint,
    forcePathStyle: true,
  })

  // --- Check if the S3 client is working by creating a session.
  try {
    const command = new ListBucketsCommand({})
    const response = await this.storageS3client.send(command)
    const exists = response.Buckets?.find(x => x.Name === this.storageS3bucketName)

    // --- If the bucket exists, return early. If not, throw an error if the bucket should exist.
    if (exists) return
    if (!this.storageS3bucketCreate) throw new Error(`The bucket "${this.storageS3bucketName}" does not exist`)

    // --- Create the bucket if it does not exist.
    const create = new CreateBucketCommand({ Bucket: this.storageS3bucketName })
    await this.storageS3client.send(create)
  }
  catch (error) {
    const message = dedent(`
      It seems that the S3 client could not connect to the storage account. Please make sure
      that the access key and secret key are correct and that they have the necessary permissions
      to access the account.

      Bucket Name: ${this.storageS3bucketName}
      Bucket Region: ${this.storageS3bucketRegion}
      Bucket Access Key: ${this.storageS3bucketAccessKey ? '*****' : 'Not provided'}
      Bucket Secret Key: ${this.storageS3bucketSecretKey ? '*****' : 'Not provided'}

      ${(error as Error).message}
    `)
    console.warn(message)
    throw error
  }
}
