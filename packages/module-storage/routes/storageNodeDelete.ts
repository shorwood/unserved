import { In } from 'typeorm'
import { setResponseStatus } from 'h3'
import { assertString, assertStringUuid, assertUndefined, createArrayParser, createSchema } from '@unshared/validation'
import { parseBoolean, split } from '@unshared/string'
import { createRoute } from '@unserve/server'
import { ModuleUser } from '@unserve/module-user'
import { ModuleStorage, StorageFile, StorageFolder } from '..'

export function assetDelete(this: ModuleStorage) {
  return createRoute(
    {
      name: 'DELETE /api/storage',
      // parameters: createSchema({
      //   id: assertStringUuid,
      // }),
      query: createSchema({
        ids: [[assertUndefined], [assertString, (x: string) => split(x, ','), createArrayParser(assertStringUuid)]],
        onlyFiles: [[assertUndefined], [assertString, parseBoolean]],
        onlyFolders: [[assertUndefined], [assertString, parseBoolean]],
      }),
    },
    async({ event, query }) => {

      // --- Check if the user has the right permissions.
      const userModule = this.getModule(ModuleUser)
      await userModule.a11n(event, { permissions: [this.permissions.DELETE.id] })

      // --- Destrucutre the parameters and body.
      const { ids = [], onlyFiles, onlyFolders } = query
      const { StorageFile, StorageFolder } = this.entities

      // --- Find the files matching the ids.
      const entities: Array<StorageFile | StorageFolder> = []
      if (!onlyFolders) {
        const folders = await StorageFile.findBy({ id: In(ids) })
        entities.push(...folders)
      }

      // --- Find the folders matching the ids.
      if (!onlyFiles) {
        const files = await StorageFolder.findBy({ id: In(ids) })
        entities.push(...files)
      }

      // --- Delete the entities.
      await Promise.all(entities.map(entity => entity.remove()))
      setResponseStatus(event, 204)
    },
  )
}
