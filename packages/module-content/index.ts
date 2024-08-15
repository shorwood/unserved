import { ModuleIcon } from '@unserved/module-icon'
import { ModuleLocale } from '@unserved/module-locale'
import { ModuleStorage } from '@unserved/module-storage'
import { ModuleUser } from '@unserved/module-user'
import { ModuleBase } from '@unserved/server'
import * as ENTITIES from './entities'
import * as ROUTES from './routes'
import { ERRORS, PERMISSIONS, resolveCategory, resolveTags } from './utils'

export * from './entities'

/**
 * The "Website" module is responsible for managing content and metadata of a website.
 * It allows the user to create, read, update, and delete the website content and customize
 * the SEO metadata of the website such as the title, the description, the URL, the logo, etc.
 */
export class ModuleContent extends ModuleBase {
  errors = ERRORS
  routes = ROUTES
  entities = ENTITIES
  permissions = PERMISSIONS
  dependencies = [ModuleUser, ModuleStorage, ModuleLocale, ModuleIcon]

  /**
   * Given a list of strings, find the `ContentPageTag` entities that match the slugs.
   * If the tag does not exist, create and save the missing tags.
   *
   * @param this The `ModuleContent` instance.
   * @param tags The list of tags to find or create.
   * @returns The `ContentPageTag` entities.
   */
  resolveTags = resolveTags.bind(this)

  /**
   * Given an UUID, find the `ContentCategory` entity that matches the UUID.
   *
   * @param this The `ModuleContent` instance.
   * @param id The UUID of the category to find.
   * @returns The `ContentCategory` entity.
   */
  resolveCategory = resolveCategory.bind(this)
}
