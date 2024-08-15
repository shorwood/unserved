import type { ModuleStorageLocal } from '../index'
import { mkdir } from 'node:fs/promises'

export async function initialize(this: ModuleStorageLocal): Promise<void> {
  if (!this.storageLocalPath) throw new Error('The local directory is required to store the assets locally.')
  await mkdir(this.storageLocalPath, { recursive: true })
}
