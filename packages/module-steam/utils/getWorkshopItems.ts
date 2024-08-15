import type { ModuleSteam } from '../index'
import type { WorkshopItem, WorkshopSearchResult } from './types'
import { toSearchParams } from '@unshared/string'

export interface GetWorkshopIemsOptions {
  key: string
  query_type: number
  page: number
  cursor: string
  numperpage: number
  creator_appid: number
  appid: number
  requiredtags: string
  excludedtags: string
  match_all_tags: boolean
  required_flags: string
  omitted_flags: string
  search_text: string
  filetype: number
  child_publishedfileid: number
  days: number
  include_recent_votes_only: boolean
  cache_max_age_seconds: number
  language: number
  required_kv_tags: string
  taggroups: string
  date_range_created: string
  date_range_updated: string
  excluded_content_descriptors: string
  admin_query: boolean
  totalonly: boolean
  ids_only: boolean
  return_vote_data: boolean
  return_tags: boolean
  return_kv_tags: boolean
  return_previews: boolean
  return_children: boolean
  return_short_description: boolean
  return_for_sale_data: boolean
  return_metadata: boolean
  return_playtime_stats: number
  return_details: boolean
  strip_description_bbcode: boolean
  desired_revision: string
  return_reactions: boolean
}

/**
 * Search for a Workshop item given an object of search parameters.
 *
 * @param this The `ModuleSteam` instance to use to search for the Workshop item.
 * @param options The search parameters to use to search for the Workshop item.
 * @returns The search results.
 */
export async function getWorkshopItems(this: ModuleSteam, options: Partial<GetWorkshopIemsOptions> = {}): Promise<WorkshopItem[]> {
  const url = new URL('/IPublishedFileService/QueryFiles/v1', this.steamBaseUrl)
  url.search = toSearchParams({ key: this.steamApiKey, ...options }, { formatArray: 'indices' }).toString()

  // --- Fetch the search results.
  const response = await fetch(url)
  if (!response.ok) throw this.errors.STEAM_API_ERROR(response)

  // --- Parse and return the search results.
  const data = await response.json() as WorkshopSearchResult
  return data.response.publishedfiledetails
}
