import { ModuleIcon } from '@unserved/module-icon'
import { ModuleStorage } from '@unserved/module-storage'
import { ModuleBase } from '@unserved/server'
import * as ENTITIES from './entities'
import * as ROUTES from './routes'
import { ERRORS, PERMISSIONS } from './utils'

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
