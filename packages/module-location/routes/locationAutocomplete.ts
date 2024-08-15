/// <reference types="h3" />
import type { ModuleLocation } from '../index'
import { createRoute } from '@unserved/server'
import { assertStringNotEmpty, assertStringNumber, assertUndefined, createAssertNumberBetween, createSchema } from '@unshared/validation'

export interface LocationAutocompleteResult {
  full: string
  latitude: number
  longitude: number
  address?: string
  street?: string
  city?: string
  region?: string
  postalCode?: string
  country?: string
}

export function locationAutocomplete(this: ModuleLocation) {
  return createRoute(
    {
      name: 'GET /api/location',
      query: createSchema({
        search: assertStringNotEmpty,
        limit: [
          [assertUndefined],
          [assertStringNumber, Number.parseInt, createAssertNumberBetween(1, 10)],
        ],
      }),
    },

    async({ query }): Promise<LocationAutocompleteResult[]> => {
      const { search, limit = 1 } = query

      // --- Fetch the addresses from the Mapbox API based on the query string.
      const addresses = await this.geocodeForward(search, { autocomplete: true, limit })
      return addresses.features.map<LocationAutocompleteResult>(x => ({
        full: x.properties.full_address,
        latitude: x.properties.coordinates.latitude,
        longitude: x.properties.coordinates.longitude,
        address: x.properties.context.address?.name,
        street: x.properties.context.street?.name,
        city: x.properties.context.locality?.name,
        region: x.properties.context.region?.name,
        postalCode: x.properties.context.postcode?.name,
        country: x.properties.context.country?.name,
      }))
    },
  )
}
