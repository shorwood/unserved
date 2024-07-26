import { ILike } from 'typeorm'
import { assertString, assertStringNotEmpty, assertUndefined, createSchema } from '@unshared/validation'
import { parseBoolean } from '@unshared/string'
import { createRoute } from '@unserve/server'
import { ModuleContact } from '../index'
import { ContactOrganizationObject } from '../entities'

export function organizationSearch(this: ModuleContact) {
  return createRoute(
    {
      name: 'GET /api/organizations',
      query: createSchema({
        search: [[assertUndefined], [assertString]],
        withAddress: [[assertUndefined], [assertStringNotEmpty, parseBoolean]],
      }),
    },

    async({ query }): Promise<ContactOrganizationObject[]> => {
      const { ContactOrganization } = this.entities
      const {
        search,
        withAddress = false,
      } = query

      // --- Find the companies in the database.
      const companies = await ContactOrganization.find({
        where: [
          { name: search ? ILike(`%${search}%`) : search },
        ],
        relations: {
          address: withAddress,
        },
      })

      // --- Return the companies.
      return companies.map(company => company.serialize())
    },
  )
}
