import type { StorageFile } from '../entities'
import type { ModuleStorage } from '../index'
import { ModuleUser } from '@unserved/module-user'
import { createRoute } from '@unserved/server'
import { parseBoolean } from '@unshared/string'
import { assertString, assertStringUuid, assertUndefined, createSchema } from '@unshared/validation'
import { StorageFolder } from '../entities'

export function storageNodeUpdateOne(this: ModuleStorage) {
  return createRoute(
    {
      name: 'PUT /api/storage/:id',
      parameters: createSchema({
        id: assertStringUuid,
      }),
      body: createSchema({
        name: [[assertUndefined], [assertString]],
        parentId: [[assertUndefined], [assertStringUuid]],
        description: [[assertUndefined], [assertString]],
        onlyFiles: [[assertUndefined], [assertString, parseBoolean]],
        onlyFolders: [[assertUndefined], [assertString, parseBoolean]],
      }),
    },
    async({ event, parameters, body }) => {

      // --- Check if the user has the right permissions to purge files.
      const userModule = this.getModule(ModuleUser)
      await userModule.a11n(event, { permissions: [this.permissions.UPDATE.id] })

      // --- Destrucutre the body.
      const {
        name,
        parentId,
        description,
        onlyFiles = false,
        onlyFolders = false,
      } = body

      // --- Find the file or folder.
      const { id } = parameters
      const { StorageFile } = this.entities
      let entity: StorageFile | StorageFolder | null
      if (onlyFiles) entity = await StorageFile.findOneBy({ id })
      else if (onlyFolders) entity = await StorageFolder.findOneBy({ id })
      else entity = await StorageFile.findOneBy({ id }) ?? await StorageFolder.findOneBy({ id })

      // --- Update the entity.
      if (!entity) throw this.errors.ASSET_FILE_NOT_FOUND(id)
      if (name) entity.name = name
      if (description) entity.description = description
      if (parentId) entity.parent = await this.resolveFolder(parentId)

      // --- Save and return the serialized entity.
      await entity.save()
      return entity.serialize()
    },
  )
}
