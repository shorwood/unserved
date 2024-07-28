import { ILike } from 'typeorm'
import { assertString, assertStringNumber, assertUndefined, createParser } from '@unshared/validation'
import { parseBoolean } from '@unshared/string'
import { createRoute } from '@unserved/server'
import { ModuleUser } from '@unserved/module-user'
import { ModuleForm } from '../index'

export function formSearch(this: ModuleForm) {
  return createRoute(
    {
      name: 'GET /api/forms',
      query: createParser({
        search: [[assertUndefined], [assertString]],
        page: [[assertUndefined], [assertStringNumber, Number.parseInt]],
        limit: [[assertUndefined], [assertStringNumber, Number.parseInt]],
        withIconData: [[assertUndefined], [assertString, parseBoolean]],
        withImageData: [[assertUndefined], [assertString, parseBoolean]],
        withBannerData: [[assertUndefined], [assertString, parseBoolean]],
        withSubmissions: [[assertUndefined], [assertString, parseBoolean]],
      }),
    },
    async({ event, query }) => {

      // --- Check if the user has the right permissions.
      const userModule = this.getModule(ModuleUser)
      await userModule.a11n(event, {
        optional: true,
        permissions: [this.permissions.FORM_SEARCH.id],
      })

      // --- Deconstruct the query.
      const { search } = query
      const {
        limit = 10,
        page = 1,
        withIconData = false,
        withImageData = false,
        withBannerData = false,
        withSubmissions = false,
      } = query

      // --- Fetch the forms.
      const { Form } = this.entities
      const forms = await Form.find({
        where: [
          { name: search ? ILike(`%${search}%`) : undefined },
          { slug: search ? ILike(`%${search}%`) : undefined },
        ],
        relations: {
          image: true,
          banner: true,
          submissions: withSubmissions,
          icon: { collection: withIconData },
        },
        order: {
          createdAt: 'DESC',
        },
        take: limit,
        skip: (page - 1) * limit,
      })

      // --- Return the form entities.
      return Promise.all(
        forms.map(form => form.serialize(this, {
          withIconData,
          withImageData,
          withBannerData,
        })),
      )
    },
  )
}
