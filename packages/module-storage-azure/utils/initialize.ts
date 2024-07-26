import { dedent } from '@unshared/string'
import { BlobServiceClient } from '@azure/storage-blob'
import { ModuleStorageAzure } from '../index'

export async function initialize(this: ModuleStorageAzure): Promise<void> {
  if (this.storageAzureClient instanceof BlobServiceClient) return

  // --- Assert that the required options are provided.
  if (!this.storageAzureConnectionString)
    throw new Error('The connection string is required to connect to the Azure Storage container.')
  if (!this.storageAzureContainerName)
    throw new Error('The container name is required to connect to the Azure Storage container.')

  // --- Check if the Azure Blob client is working.
  try {
    this.storageAzureClient = BlobServiceClient.fromConnectionString(this.storageAzureConnectionString)
    this.storageAzureContainer = this.storageAzureClient.getContainerClient(this.storageAzureContainerName)

    // --- Check if the client is working by listing the containers.
    const containers = this.storageAzureClient.listContainers()
    for await (const container of containers) if (container.name === this.storageAzureContainerName) return
  }
  catch (error) {
    const message = dedent(`
      It seems that the Azure Blob client could not connect to the storage account. Please make sure
      that the connection string is correct and that it has the necessary permissions to access the account.

      Connection String: ${this.storageAzureConnectionString ? '*****' : 'Not provided'}
      Container Name: ${this.storageAzureContainerName}
    `)
    console.warn(message)
    throw error
  }
}
