import { mkdir } from 'node:fs/promises'
import { ModuleStorageLocal } from '../index'

export async function initialize(this: ModuleStorageLocal): Promise<void> {
  if (!this.storageLocalPath) throw new Error('The local directory is required to store the assets locally.')
  await mkdir(this.storageLocalPath, { recursive: true })
}
