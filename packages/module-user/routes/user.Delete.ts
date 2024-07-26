import { assertStringUuid, createSchema } from '@unshared/validation'
import { createRoute } from '@unserve/server'
import { ModuleUser } from '../index'

export function userDelete(this: ModuleUser) {
  return createRoute(
    {
      name: 'DELETE /api/users/:id',
      parameters: createSchema({
        id: assertStringUuid,
      }),
    },
    async({ event, parameters }) => {

      // --- Check if the user has the right permissions.
      await this.a11n(event, { permissions: [this.permissions.USER_DELETE.id] })

      // --- Find the user by the ID.
      const { id } = parameters
      const { User } = this.entities
      const user = await User.findOne({ where: { id } })
      if (!user) return this.errors.USER_NOT_FOUND(id)

      // --- Delete the user.
      await user.remove()
    },
  )
}
