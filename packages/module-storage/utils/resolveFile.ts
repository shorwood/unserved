import { UUID } from 'node:crypto'
import { ModuleStorage } from '../index'
import { StorageFile } from '../entities'

/**
 * Given an ID, return its `StorageFile` entity. If no ID is provided, throw an error.
 * You can also pass `null` to force the function to return `undefined`.
 *
 * @param id The ID of the asset file to resolve.
 * @returns The `StorageFile` entity of the resolved asset file.
 */
export async function resolveFile(this: ModuleStorage, id?: UUID | null): Promise<StorageFile | undefined> {
  if (id === null) return
  if (!id) throw this.errors.ASSET_MISSING_FILE_ID()
  const { StorageFile } = this.entities
  const file = await StorageFile.findOneBy({ id })
  if (!file) throw this.errors.ASSET_FILE_NOT_FOUND(id)
  return file
}
