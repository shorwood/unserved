import { createRoute } from '@unserve/server'
import { ModuleUser } from '@unserve/module-user'
import { ModuleStorage } from '../index'

export function storagePurge(this: ModuleStorage) {
  return createRoute(
    'DELETE /api/storage/purge',
    async({ event }) => {

      // --- Check if the user has the right permissions to purge files.
      const userModule = this.getModule(ModuleUser)
      await userModule.a11n(event, { permissions: [this.permissions.PURGE.id] })

      // --- Purge all files.
      return await this.purge()
    },
  )
}
