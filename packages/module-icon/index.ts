import { ModuleBase } from '@unserve/server'
import { ModuleUser } from '@unserve/module-user'
import { ERRORS, PERMISSIONS, resolveIcon } from './utils'
import * as ROUTES from './routes'
import * as ENTITIES from './entities'

export * from './entities'

export type ModuleIconOptions = Partial<Pick<
  ModuleIcon,
  'iconCdn'
  | 'iconIconifyUrl'
>>

/**
 * The "Icon" module provides a way to manage icons for the website content
 * using the Iconify CDN. The icons are stored as assets in the asset module.
 */
export class ModuleIcon extends ModuleBase {
  errors = ERRORS
  routes = ROUTES
  entities = ENTITIES
  permissions = PERMISSIONS
  dependencies = [ModuleUser]

  constructor(options: ModuleIconOptions = {}) {
    super()
    if (options.iconCdn) this.iconCdn = options.iconCdn
    if (options.iconIconifyUrl) this.iconIconifyUrl = options.iconIconifyUrl
  }

  /**
   * The URL to an NPM CDN that hosts the `@iconify/json` package. This package
   * is used to import the icon collections from the Iconify API.
   *
   * @default 'https://esm.sh/'
   */
  iconCdn = process.env.ICON_CDN ?? 'https://esm.sh/'

  /**
   * The URL of the Iconify API used to gather information about the icons and
   * their collections. It is used to fetch the icons from the remote source.
   */
  iconIconifyUrl = process.env.ICON_ICONIFY_URL ?? 'https://api.iconify.design/'

  /**
   * Given an icon name, download the icon from the configured CDN and
   * store it using the `Asset` module. The icon is then returned as an
   * `Asset` entity. If the icon is already stored, it is returned directly.
   *
   * @param name The name of the icon to resolve.
   * @returns The `Asset` entity of the icon.
   */
  resolveIcon = resolveIcon.bind(this)
}
