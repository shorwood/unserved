import { assertStringUuid, assertUndefined, createArrayParser, createAssertInstance, createParser } from '@unshared/validation'
import { toArray } from '@unshared/collection'
import { createRoute } from '@unserve/server'
import { ModuleUser } from '@unserve/module-user'
import { ModuleStorage, StorageFile } from '..'

export function storageFileUpload(this: ModuleStorage) {
  return createRoute(
    {
      name: 'POST /api/storage',
      formData: createParser({
        files: [toArray, createArrayParser(createAssertInstance(File))],
        parentId: [[assertUndefined], [assertStringUuid]],
      }),
    },

    async({ event, formData }) => {
      const { files, parentId } = formData

      // --- Check if the user has the right permissions to upload assets.
      const userModule = this.getModule(ModuleUser)
      await userModule.a11n(event, { permissions: [this.permissions.FILE_UPLOAD.id] })

      // --- Resolve the parent folder. If no `parentId` is provided,
      // --- get or create the root folder and use it as the new files' parent.
      const parent = await this.resolveFolder(parentId, { withChildren: true, onlyFiles: true })

      // --- Upload each file separately.
      const entities: StorageFile[] = []
      for (const file of files) {
        const entity = await this.upload(file)
        parent.files = parent.files ?? []
        parent.files.push(entity)
      }

      // --- Return the uploaded assets.
      await parent.save()
      return entities.map(x => x.serialize())
    },
  )
}
