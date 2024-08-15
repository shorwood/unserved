import { ModuleLocation } from '@unserved/module-location'
import { ModuleStorage } from '@unserved/module-storage'
import { ModuleUser } from '@unserved/module-user'
import { ModuleBase } from '@unserved/server'
import * as ENTITIES from './entities'
import * as ROUTES from './routes'
import { ERRORS, PERMISSIONS } from './utils'

export * from './entities'

/**
 * The "ModuleContact" module is responsible for managing the companies in the application.
 * It provides multiple utilities to search and autocomplete companies based on the
 * available data.
 */
export class ModuleContact extends ModuleBase {
  routes = ROUTES
  errors = ERRORS
  entities = ENTITIES
  permissions = PERMISSIONS
  dependencies = [ModuleUser, ModuleStorage, ModuleLocation]
}
