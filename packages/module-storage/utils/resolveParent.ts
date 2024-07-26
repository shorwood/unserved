import { ModuleBase } from '@unserve/server'
import { StorageFile, StorageFolder } from '../entities'
import { ModuleStorage } from '../index'

/**
 * Given an `StorageFile` or `StorageFolder` entity, query the database to find the parent of
 * the entity and return it. If the parent is already loaded, return it directly.
 *
 * @param module The module to use to resolve the parent of the entity.
 * @param entity The entity to find the parent of.
 * @returns A promise that resolves to the parent of the entity.
 */
export async function resolveParent(module: ModuleBase, entity: StorageFile | StorageFolder): Promise<StorageFolder | null> {
  const { StorageFolder } = module.getModule(ModuleStorage).entities

  // --- If the parent is already loaded, return it directly.
  if (entity.parent) return entity.parent

  // --- Otherwise, query the database to find the parent of the entity.
  if (entity instanceof StorageFile) {
    return await StorageFolder.findOne({
      where: { id: entity.id },
      select: ['parent'],
      relations: { parent: true },
    })
  }

  return await StorageFolder.findOne({
    where: { id: entity.id },
    select: ['parent'],
    relations: { parent: true },
  })
}
