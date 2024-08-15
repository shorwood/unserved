import type { UUID } from 'node:crypto'
import type { ModuleForm } from '../index'
import { createRoute } from '@unserved/server'
import { assertObject, assertStringNotEmpty, createRule, createSchema, EXP_UUID } from '@unshared/validation'

export function formSubmissionCreate(this: ModuleForm) {
  return createRoute(
    {
      name: 'POST /api/forms/:id/submit',
      parameters: createSchema({
        id: assertStringNotEmpty,
      }),
      body: createRule(
        assertObject<Record<string, string>>,
      ),
    },
    async({ parameters, body }) => {
      const { id } = parameters
      const { Form, FormSubmission } = this.entities

      // --- Fetch the form.
      const isUUID = EXP_UUID.test(id)
      const form = await Form.findOne({
        where: isUUID ? { id: id as UUID } : { slug: id },
        relations: { submissions: true },
      })

      // --- Create and save the form submission.
      if (!form) throw this.errors.E_FORM_NOT_FOUND(id)
      const submission = FormSubmission.create()
      submission.content = body
      submission.form = form
      await submission.save()

      // --- Return the form data.
      return await submission.serialize(this)
    },
  )
}
