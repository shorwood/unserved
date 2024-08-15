import type { UUID } from 'node:crypto'
import type { ModuleForm } from '../index'
import { createRoute } from '@unserved/server'
import { parseBoolean } from '@unshared/string'
import { assertString, assertStringNotEmpty, assertStringUuid, assertUndefined, createParser, EXP_UUID } from '@unshared/validation'

export function formGet(this: ModuleForm) {
  return createRoute(
    {
      name: 'GET /api/forms/:id',
      parameters: createParser({
        id: [[assertStringUuid], [assertStringNotEmpty]],
      }),
      query: createParser({
        withIconData: [[assertUndefined], [assertString, parseBoolean]],
        withImageData: [[assertUndefined], [assertString, parseBoolean]],
        withBannerData: [[assertUndefined], [assertString, parseBoolean]],
        withSubmissions: [[assertUndefined], [assertString, parseBoolean]],
      }),
    },
    async({ parameters, query }) => {

      // --- Destructure the parameters and query.
      const { Form } = this.entities
      const { id } = parameters
      const {
        withIconData = false,
        withImageData = false,
        withBannerData = false,
        withSubmissions = false,
      } = query

      // --- Fetch the form.
      const isUUID = EXP_UUID.test(id)
      const form = await Form.findOne({
        where: isUUID ? { id: id as UUID } : { slug: id },
        relations: {
          image: true,
          banner: true,
          submissions: withSubmissions,
          icon: { collection: withIconData },
        },
      })

      // --- Return the form entity.
      if (!form) throw this.errors.E_FORM_NOT_FOUND(id)
      return await form.serialize(this, {
        withIconData,
        withImageData,
        withBannerData,
      })
    },
  )
}
