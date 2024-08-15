import type { ContactOrganizationObject } from '../entities'
import type { ModuleContact } from '../index'
import { createRoute } from '@unserved/server'
import { parseBoolean } from '@unshared/string'
import { assertString, assertStringNotEmpty, assertUndefined, createSchema } from '@unshared/validation'
import { ILike } from 'typeorm'

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
