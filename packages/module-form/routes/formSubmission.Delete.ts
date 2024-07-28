import { assertStringUuid, createSchema } from '@unshared/validation'
import { createRoute } from '@unserved/server'
import { ModuleUser } from '@unserved/module-user'
import { ModuleForm } from '../index'

export function formSubmissionDelete(this: ModuleForm) {
  return createRoute(
    {
      name: 'DELETE /api/forms/submissions/:id',
      parameters: createSchema({
        id: assertStringUuid,
      }),
    },
    async({ event, parameters }) => {

      // --- Check if the user has the right permissions.
      const userModule = this.getModule(ModuleUser)
      await userModule.a11n(event, { permissions: [this.permissions.SUBMISSION_DELETE.id] })

      // --- Fetch the form submission.
      const { id } = parameters
      const { FormSubmission } = this.entities
      const submission = await FormSubmission.findOne({
        where: { id },
        relations: { form: true },
      })

      // --- Delete the form submission.
      if (!submission) throw this.errors.E_FORM_SUBMISSION_NOT_FOUND(id)
      await submission.remove()

      // --- Return the form data.
      return await submission.serialize(this)
    },
  )
}
