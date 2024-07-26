import { assertString, assertStringUuid, assertUndefined, createParser } from '@unshared/validation'
import { parseBoolean } from '@unshared/string'
import { createRoute } from '@unserve/server'
import { ModuleUser } from '@unserve/module-user'
import { ModuleForm } from '../index'

export function formSubmissionsGet(this: ModuleForm) {
  return createRoute(
    {
      name: 'GET /api/forms/:id/submissions',
      parameters: createParser({
        id: assertStringUuid,
      }),
      query: createParser({
        withForm: [[assertUndefined], [assertString, parseBoolean]],
        withIconData: [[assertUndefined], [assertString, parseBoolean]],
        withImageData: [[assertUndefined], [assertString, parseBoolean]],
        withBannerData: [[assertUndefined], [assertString, parseBoolean]],
      }),
    },
    async({ event, parameters, query }) => {

      // --- Check if the user has the right permissions.
      const userModule = this.getModule(ModuleUser)
      await userModule.a11n(event, { permissions: [this.permissions.SUBMISSION_READ.id] })

      // --- Destructure the parameters and query.
      const { id } = parameters
      const {
        withForm = false,
        withIconData = false,
        withImageData = false,
        withBannerData = false,
      } = query

      // --- Fetch the form.
      const { FormSubmission } = this.entities
      const submission = await FormSubmission.findOne({
        where: { id },
        relations: {
          form: {
            image: true,
            banner: true,
            icon: { collection: withIconData },
          },
        },
      })

      // --- Return the form submissions.
      if (!submission) throw this.errors.E_FORM_NOT_FOUND(id)
      return await submission.serialize(this, {
        withForm,
        withIconData,
        withImageData,
        withBannerData,
      })
    },
  )
}
