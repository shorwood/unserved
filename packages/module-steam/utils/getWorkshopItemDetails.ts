import { toSearchParams } from '@unshared/string'
import { WorkshopItemDetail, WorkshopItemResult } from './types'
import { ModuleSteam } from '../index'

export interface GetWorkshopItemDetailsOptions {
  publishedfileids: string[]
  includetags: boolean
  includeadditionalpreviews: boolean
  includechildren: boolean
  includekvtags: boolean
  includevotes: boolean
  short_description: boolean
  includeforsaledata: boolean
  includemetadata: boolean
  language: number
  return_playtime_stats: number
  appid: number
  strip_description_bbcode: boolean
  desired_revision: string
  includereactions: boolean
  admin_query: boolean
}

/**
 * Get the details of a Workshop item given its ID.
 *
 * @param options The options to use to get the Workshop item details.
 * @returns The details of the Workshop item.
 */
export async function getWorkshopItemDetails(this: ModuleSteam, options: Partial<GetWorkshopItemDetailsOptions>): Promise<WorkshopItemDetail> {
  const url = new URL('/IPublishedFileService/GetDetails/v1/', this.steamBaseUrl)
  url.search = toSearchParams({ key: this.steamApiKey, ...options }, { formatArray: 'indices' }).toString()

  // --- Fetch the search results.
  const response = await fetch(url)
  if (!response.ok) throw this.errors.STEAM_API_ERROR(response)

  const data = await response.json() as WorkshopItemResult
  return data.response.publishedfiledetails[0]
}
