import { assertStringNotEmpty, assertStringUuid, assertUndefined, createParser } from '@unshared/validation'
import { createRoute } from '@unserve/server'
import { ModuleUser } from '@unserve/module-user'
import { ModuleStorage } from '../index'

export function storageCreateFolder(this: ModuleStorage) {
  return createRoute(
    {
      name: 'POST /api/storage/folders',
      body: createParser({
        name: assertStringNotEmpty,
        parentId: [[assertUndefined], [assertStringUuid]],
      }),
    },
    async({ event, body }) => {
      const { name, parentId } = body
      const { StorageFolder } = this.entities

      // --- Check if the user has the right permissions to upload assets.
      const userModule = this.getModule(ModuleUser)
      await userModule.a11n(event, { permissions: [this.permissions.FOLDER_CREATE.id] })

      // --- Create the folder.
      const folder = new StorageFolder()
      folder.name = name
      folder.parent = await this.resolveFolder(parentId)

      // --- Save and return the folder.
      await folder.save()
      return folder.serialize()
    },
  )
}
