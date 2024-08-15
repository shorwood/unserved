import type { ContactOrganizationObject } from '../entities'
import type { ModuleContact } from '../index'
import { createRoute } from '@unserved/server'
import { parseBoolean } from '@unshared/string'
import { assertString, assertStringNotEmpty, assertUndefined, createSchema, EXP_UUID } from '@unshared/validation'

export function organizationGet(this: ModuleContact) {
  return createRoute(
    {
      name: 'GET /api/organizations/:idOrSlug',
      parameters: createSchema({
        idOrSlug: [assertString],
      }),
      query: createSchema({
        withAddress: [[assertUndefined], [assertStringNotEmpty, parseBoolean]],
      }),
    },

    async({ parameters, query }): Promise<ContactOrganizationObject> => {
      const { ContactOrganization } = this.entities
      const { idOrSlug } = parameters
      const {
        withAddress = false,
      } = query

      // --- Find the company in the database.
      const isUUID = EXP_UUID.test(idOrSlug)
      const company = await ContactOrganization.findOne({
        where: { [isUUID ? 'id' : 'slug']: idOrSlug },
        relations: {
          address: withAddress,
        },
      })

      // --- Return the company.
      if (!company) throw this.errors.ORGANIZATION_NOT_FOUND(idOrSlug)
      return company.serialize()
    },
  )
}
