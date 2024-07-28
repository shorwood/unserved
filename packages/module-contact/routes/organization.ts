import { EXP_UUID, assertString, assertStringNotEmpty, assertUndefined, createSchema } from '@unshared/validation'
import { parseBoolean } from '@unshared/string'
import { createRoute } from '@unserved/server'
import { ModuleContact } from '../index'
import { ContactOrganizationObject } from '../entities'

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
