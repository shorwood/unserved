import { Location, ModuleLocation } from '../index'

/**
 * Given an address string, geo-code the address and return a new `Location` entity.
 *
 * @param query The address to resolve.
 * @returns The `Location` entity.
 */
export async function resolveLocation(this: ModuleLocation, query: string): Promise<Location> {
  const { Location } = this.entities

  // --- Geo-code the address.
  query = query.slice(0, 255)
  const result = await this.geocodeForward(query, { limit: 1 })
  if (result.features.length === 0) throw new Error(`Could not resolve the address: ${query}`)
  const feature = result.features[0]

  // --- Check if the `Location` already exists in the database.
  const existingLocation = await Location.findOneBy({ externalId: feature.id })
  if (existingLocation) return existingLocation

  // --- Extract the location details.
  const location = Location.create()
  location.externalId = feature.id
  location.address = feature.properties.context.address?.name
  location.postalCode = feature.properties.context.postcode?.name
  location.city = feature.properties.context.place?.name
  location.region = feature.properties.context.region?.name
  location.country = feature.properties.context.country?.name
  location.longitude = feature.properties.coordinates.longitude
  location.latitude = feature.properties.coordinates.latitude
  return location
}
