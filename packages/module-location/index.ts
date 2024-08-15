import { ModuleBase } from '@unserved/server'
import * as ENTITIES from './entities'
import * as ROUTES from './routes'
import { geocodeForward, resolveLocation } from './utils'

export * from './entities'

export type ModuleLocationOptions = Partial<Pick<
  ModuleLocation,
  'locationMapboxAccessToken'
  | 'locationMapboxUrl'
>>

/**
 * The "Location" module is responsible for managing the addresses of the profiles, users,
 * companies, and orders. It also provides the ability to search for addresses based on
 * the location and provide an autocomplete feature for the address fields.
 */
export class ModuleLocation extends ModuleBase {
  routes = ROUTES
  entities = ENTITIES
  permissions = {}

  constructor(options: ModuleLocationOptions = {}) {
    super()
    if (options.locationMapboxUrl) this.locationMapboxUrl = options.locationMapboxUrl
    if (options.locationMapboxAccessToken) this.locationMapboxAccessToken = options.locationMapboxAccessToken
  }

  /**
   * The base URL of the Mapbox API. It is used to search for addresses based on the
   * location and provide an autocomplete feature for the address fields.
   *
   * @default process.env.LOCATION_MAPBOX_URL ?? 'https://api.mapbox.com'
   */
  locationMapboxUrl = process.env.LOCATION_MAPBOX_URL ?? 'https://api.mapbox.com'

  /**
   * The access token of the Mapbox API. It is used to authenticate the requests to the
   * Mapbox API.
   *
   * @default process.env.LOCATION_MAPBOX_ACCESS_TOKEN
   */
  locationMapboxAccessToken = process.env.LOCATION_MAPBOX_ACCESS_TOKEN

  /**
   * Given a query string and a location, this function will attempt to return a list of
   * possible addresses that match the query string based on the location. The results
   * are sorted by relevance and can be used to provide an autocomplete feature for address
   * fields within the application.
   *
   * @param query The query string to search for the address.
   * @param options The options to customize the search results.
   * @returns A list of possible addresses that match the query string based on the location.
   * @example moduleLocation.geocodeForward('Paris', { autocomplete: true })
   */
  geocodeForward = geocodeForward.bind(this)

  /**
   * Given an address string, geo-code the address and return a new `Location` entity.
   *
   * @param address The address string.
   * @returns The `Location` entity.
   */
  resolveLocation = resolveLocation.bind(this)
}
