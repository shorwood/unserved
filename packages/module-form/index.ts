import { ModuleBase } from '@unserve/server'
import { ModuleStorage } from '@unserve/module-storage'
import { ModuleIcon } from '@unserve/module-icon'
import { ERRORS, PERMISSIONS } from './utils'
import * as ROUTES from './routes'
import * as ENTITIES from './entities'

export * from './entities'

/**
 * The "Icon" module provides a way to manage icons for the website content
 * using the Iconify CDN. The icons are stored as assets in the asset module.
 */
export class ModuleForm extends ModuleBase {
  errors = ERRORS
  routes = ROUTES
  entities = ENTITIES
  permissions = PERMISSIONS
  dependencies = [ModuleIcon, ModuleStorage]
}
