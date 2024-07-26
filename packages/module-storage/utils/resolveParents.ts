import { ModuleBase } from '@unserve/server'
import { resolveParent } from './resolveParent'
import { StorageFile, StorageFolder } from '../entities'

/**
 * Given an `StorageFile` or `StorageFolder` entity, query the database to find all the parents of
 * the entity and return them. If the parents are already loaded, return them directly.
 *
 * @param module The module to use to resolve the parents of the entity.
 * @param entity The entity to find the parents of.
 * @returns A promise that resolves to the parents of the entity.
 */
export async function resolveParents(module: ModuleBase, entity: StorageFile | StorageFolder): Promise<StorageFolder[]> {
  const parents: StorageFolder[] = []

  // --- Recursively get the parents of the entity.
  let currentParent = await resolveParent(module, entity)
  while (currentParent) {
    parents.push(currentParent)
    currentParent = await resolveParent(module, currentParent)
  }

  // --- Return the parents.
  return parents
}
