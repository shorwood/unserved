import type { ModuleForm } from '../index'
import { ModuleUser } from '@unserved/module-user'
import { createRoute } from '@unserved/server'
import { parseBoolean } from '@unshared/string'
import { assertString, assertStringNumber, assertUndefined, createParser } from '@unshared/validation'
import { ILike } from 'typeorm'

export function formSubmissionsSearch(this: ModuleForm) {
  return createRoute(
    {
      name: 'GET /api/forms/submissions',
      query: createParser({
        search: [[assertUndefined], [assertString]],
        page: [[assertUndefined], [assertStringNumber, Number.parseInt]],
        limit: [[assertUndefined], [assertStringNumber, Number.parseInt]],
        withForm: [[assertUndefined], [assertString, parseBoolean]],
        withIconData: [[assertUndefined], [assertString, parseBoolean]],
        withImageData: [[assertUndefined], [assertString, parseBoolean]],
        withBannerData: [[assertUndefined], [assertString, parseBoolean]],
      }),
    },
    async({ event, query }) => {

      // --- Check if the user has the right permissions.
      const userModule = this.getModule(ModuleUser)
      await userModule.a11n(event, { permissions: [this.permissions.SUBMISSION_SEARCH.id] })

      // --- Deconstruct the query.
      const {
        search,
        limit = 10,
        page = 1,
        withForm = false,
        withIconData = false,
        withImageData = false,
        withBannerData = false,
      } = query

      // --- Fetch the submissions.
      const { FormSubmission } = this.entities
      const submissions = await FormSubmission.find({
        where: [
          { form: { name: search ? ILike(`%${search}%`) : undefined } },
          { form: { slug: search ? ILike(`%${search}%`) : undefined } },
        ],
        relations: {
          form: {
            image: true,
            banner: true,
            icon: { collection: withIconData },
          },
        },
        order: {
          createdAt: 'DESC',
        },
        take: limit,
        skip: (page - 1) * limit,
      })

      // --- Return the form entities.
      return Promise.all(
        submissions.map(submission => submission.serialize(this, {
          withForm,
          withIconData,
          withImageData,
          withBannerData,
        })),
      )
    },
  )
}
