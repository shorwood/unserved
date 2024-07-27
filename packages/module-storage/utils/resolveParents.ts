import { resolveParent } from './resolveParent'
import { ModuleStorage } from '../index'
import { StorageFile, StorageFolder } from '../entities'

/**
 * Given an `StorageFile` or `StorageFolder` entity, query the database to find all the parents of
 * the entity and return them. If the parents are already loaded, return them directly.
 *
 * @param entity The entity to find the parents of.
 * @returns A promise that resolves to the parents of the entity.
 */
export async function resolveParents(this: ModuleStorage, entity: StorageFile | StorageFolder): Promise<StorageFolder[]> {
  const parents: StorageFolder[] = []

  // --- Recursively get the parents of the entity.
  let currentParent = await resolveParent.call(this, entity)
  while (currentParent) {
    parents.push(currentParent)
    currentParent = await resolveParent.call(this, currentParent)
  }

  // --- Return the parents.
  return parents
}
