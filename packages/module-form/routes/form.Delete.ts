import { setResponseStatus } from 'h3'
import { assertStringUuid, createParser } from '@unshared/validation'
import { createRoute } from '@unserve/server'
import { ModuleUser } from '@unserve/module-user'
import { ModuleForm } from '../index'

export function formDelete(this: ModuleForm) {
  return createRoute(
    {
      name: 'DELETE /api/forms/:id',
      parameters: createParser({
        id: assertStringUuid,
      }),
    },
    async({ event, parameters }) => {
      const { Form } = this.entities
      const { id } = parameters

      // --- Check if the user has the right permissions.
      const userModule = this.getModule(ModuleUser)
      await userModule.a11n(event, { permissions: [this.permissions.FORM_DELETE.id] })

      // --- Fetch the form.
      const form = await Form.findOne({ where: { id } })
      if (!form) throw this.errors.E_FORM_NOT_FOUND(id)

      // --- Delete the form.
      await form.remove()
      setResponseStatus(event, 204)
    },
  )
}
