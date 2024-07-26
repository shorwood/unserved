import { assertString, assertStringUuid, assertUndefined, createSchema } from '@unshared/validation'
import { parseBoolean } from '@unshared/string'
import { createRoute } from '@unserve/server'
import { ModuleUser } from '@unserve/module-user'
import { ModuleStorage } from '../index'

export function assetSearch(this: ModuleStorage) {
  return createRoute(
    {
      name: 'GET /api/storage',
      query: createSchema({
        id: [[assertUndefined], [assertStringUuid]],
        search: [[assertUndefined], [assertString]],
        onlyFiles: [[assertUndefined], [assertString, parseBoolean]],
        onlyFolders: [[assertUndefined], [assertString, parseBoolean]],
        withChildren: [[assertUndefined], [assertString, parseBoolean]],
        withParents: [[assertUndefined], [assertString, parseBoolean]],
      }),
    },
    async({ event, query }) => {

      // --- Check if the user has the right permissions to upload assets.
      const userModule = this.getModule(ModuleUser)
      await userModule.a11n(event, { permissions: [this.permissions.FOLDER_READ.id] })

      const {
        id,
        onlyFiles = false,
        onlyFolders = false,
        withChildren = false,
        withParents = false,
      } = query

      // --- Find the folder with the given id.
      const folder = await this.resolveFolder(id, {
        withChildren,
        withParents,
        onlyFiles,
        onlyFolders,
      })

      // --- Serialize the folder with the given options.
      return folder.serialize({
        withParents,
        withChildren,
      })
    },
  )
}
