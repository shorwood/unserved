import type { UUID } from 'node:crypto'
import type { ModuleStorage } from '../index'

export interface ResolveFolderOptions {
  withChildren?: boolean
  withParents?: boolean
  onlyFiles?: boolean
  onlyFolders?: boolean
}

/**
 * Given an ID, return its `StorageFolder` entity. If no ID is provided,
 * return the existing root folder or create a new one.
 *
 * @param this The `ModuleStorage` instance.
 * @param id The ID of the asset folder to resolve.
 * @param options The options of the resolution.
 * @returns The `StorageFolder` entity of the resolved asset folder.
 */
export async function resolveFolder(this: ModuleStorage, id?: UUID, options: ResolveFolderOptions = {}) {
  const { StorageFolder } = this.entities
  const {
    withChildren = false,
    withParents = false,
    onlyFiles = false,
    onlyFolders = false,
  } = options

  // --- Find the folder with the given ID.
  const folder = await StorageFolder.findOne({
    where: {
      id,
      isRoot: id ? undefined : true,
    },
    relations: {
      parent: withParents ? { parent: { parent: true } } : false,
      files: withChildren && !onlyFolders,
      folders: withChildren && !onlyFiles,
    },
    order: {
      name: 'ASC',
      files: withChildren && !onlyFolders ? { name: 'ASC' } : undefined,
      folders: withChildren && !onlyFiles ? { name: 'ASC' } : undefined,
    },
  })

  // --- If no root folder was found, throw an error if an ID was provided.
  // --- Otherwise, it means that the root folder does not exist and we need to create it.
  if (!folder && id) throw this.errors.ASSET_FOLDER_NOT_FOUND(id)
  if (!folder) {
    const root = new StorageFolder()
    root.name = 'Root'
    root.isRoot = true
    return await root.save()
  }

  // --- Return the resolved folder.
  return folder
}
