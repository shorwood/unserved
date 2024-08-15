import type { ModuleLocation } from '../index'
import type { GeocodeForwardResult } from './types'
import { toSearchParams } from '@unshared/string'

export interface GeocodeForwardOptions {
  autocomplete?: boolean
  country?: string
  proximity?: string
  bbox?: string
  types?: string
  limit?: number
  language?: string
  worldview?: 'ar' | 'cn' | 'in' | 'jp' | 'ma' | 'ru' | 'tr' | 'us'
}

/**
 * Given a query string and a location, this function will attempt to return a list of
 * possible addresses that match the query string based on the location. The results
 * are sorted by relevance and can be used to provide an autocomplete feature for address
 * fields within the application.
 *
 * @param query The query string to search for the address.
 * @param options The options to customize the search results.
 * @returns A list of possible addresses that match the query string based on the location.
 * @example geocodeForward(moduleLocation, 'Paris', { autocomplete: true })
 */
export async function geocodeForward(this: ModuleLocation, query: string, options: GeocodeForwardOptions): Promise<GeocodeForwardResult> {
  const { locationMapboxUrl, locationMapboxAccessToken: access_token } = this
  const url = new URL('/search/geocode/v6/forward', locationMapboxUrl)
  url.search = toSearchParams({ q: query, ...options, access_token }, { formatArray: 'indices' }).toString()

  // --- Fetch the search results.
  const response = await fetch(url)
  if (!response.ok) throw new Error(await response.text())
  return await response.json() as GeocodeForwardResult
}
