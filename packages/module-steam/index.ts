import { join } from 'node:path'
import { homedir } from 'node:os'
import { ModuleBase } from '@unserve/server'
import { ERRORS, downloadWorkshopItem, getWorkshopItemDetails, getWorkshopItems } from './utils'
import * as ROUTES from './routes'

export class ModuleSteam extends ModuleBase {
  routes = ROUTES
  errors = ERRORS

  constructor(options: Partial<ModuleSteam> = {}) {
    super()
    if (options.steamApiKey) this.steamApiKey = options.steamApiKey
    if (options.steamBaseUrl) this.steamBaseUrl = options.steamBaseUrl
    if (options.steamcmdPath) this.steamcmdPath = options.steamcmdPath
    if (options.steamcmdUsername) this.steamcmdUsername = options.steamcmdUsername
    if (options.steamcmdPassword) this.steamcmdPassword = options.steamcmdPassword
  }

  /**
   * The Steam API key used to authenticate requests to the Steam API.
   *
   * @default 'process.env.STEAM_API_KEY'
   */
  steamApiKey = process.env.STEAM_API_KEY

  /**
   * The base URL of the Steam API.
   *
   * @default 'https://api.steampowered.com'
   */
  steamBaseUrl = process.env.STEAM_BASE_URL ?? 'https://api.steampowered.com'

  /**
   * The path to the `steamcmd` utility. Used to download Workshop items.
   *
   * @default process.env.STEAMCMD_PATH ?? '/home/<USER>/Steam'
   */
  steamcmdPath = process.env.STEAMCMD_PATH ?? join(homedir(), 'Steam')

  /**
   * The user to login to Steam with when downloading Workshop items.
   *
   * @default 'anonymous'
   */
  steamcmdUsername = process.env.STEAMCMD_USERNAME ?? 'anonymous'

  /**
   * The password to login to Steam with when downloading Workshop items.
   *
   * @default ''
   */
  steamcmdPassword = process.env.STEAMCMD_PASSWORD ?? ''

  /**
   * Search for a Workshop item given an object of search parameters.
   *
   * @param options The search parameters to use to search for the Workshop item.
   * @returns The search results.
   */
  getWorkshopItems = getWorkshopItems.bind(this)

  /**
   * Get the details of a Workshop item given its ID.
   *
   * @param options The options to use to get the Workshop item details.
   * @returns The details of the Workshop item.
   */
  getWorkshopItemDetails = getWorkshopItemDetails.bind(this)

  /**
   * Downloads a workshop item from the Steam Workshop using the `steamcmd` utility.
   *
   * @param options The options to use to download the Workshop item.
   * @returns The path to the downloaded item.
   */
  downloadWorkshopItem = downloadWorkshopItem.bind(this)
}
