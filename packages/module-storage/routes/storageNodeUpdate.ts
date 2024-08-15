import type { StorageFile, StorageFolder } from '../entities'
import type { ModuleStorage } from '../index'
import { ModuleUser } from '@unserved/module-user'
import { createRoute } from '@unserved/server'
import { parseBoolean } from '@unshared/string'
import { assertString, assertStringUuid, assertUndefined, createArrayParser, createSchema } from '@unshared/validation'
import { In } from 'typeorm'

export function assetNodeUpdate(this: ModuleStorage) {
  return createRoute(
    {
      name: 'PUT /api/storage',
      body: createSchema({
        ids: createArrayParser(assertStringUuid),
        name: [[assertUndefined], [assertString]],
        parentId: [[assertUndefined], [assertStringUuid]],
        description: [[assertUndefined], [assertString]],
        onlyFiles: [[assertUndefined], [assertString, parseBoolean]],
        onlyFolders: [[assertUndefined], [assertString, parseBoolean]],
      }),
    },
    async({ event, body }) => {

      // --- Check if the user has the right permissions.
      const userModule = this.getModule(ModuleUser)
      await userModule.a11n(event, { permissions: [this.permissions.UPDATE.id] })

      // --- Destrucutre the parameters and body.
      const { ids = [], name, parentId, description, onlyFiles, onlyFolders } = body
      const { StorageFile, StorageFolder } = this.entities

      // --- Find the file or folder.
      const entities: Array<StorageFile | StorageFolder> = []
      if (!onlyFiles) {
        const files = await StorageFile.findBy({ id: In(ids) })
        entities.push(...files)
      }

      if (!onlyFolders) {
        const folders = await StorageFolder.findBy({ id: In(ids) })
        entities.push(...folders)
      }

      // --- Update the entity.
      await this.withTransaction(async() => {
        for (const entity of entities) {
          if (name) entity.name = name
          if (description) entity.description = description
          if (parentId) entity.parent = await this.resolveFolder(parentId)
          await entity.save()
        }
      })

      // --- Save and return the serialized entity.
      return entities.map(x => x.serialize())
    },
  )
}
