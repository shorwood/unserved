import { ModuleBase } from '@unserved/server'
import { ModuleUser } from '@unserved/module-user'
import { ModuleStorage } from '@unserved/module-storage'
import { ModuleIcon } from '@unserved/module-icon'
import { ERRORS, PERMISSIONS, resolveCategory, resolveLanguage, resolveTags } from './utils'
import * as ROUTES from './routes'
import * as ENTITIES from './entities'

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
  dependencies = [ModuleUser, ModuleStorage, ModuleIcon]

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
   * Given an code, find the `ContentLanguage` entity that matches the ISO code.
   * If the language does not exist, throw an error.
   *
   * @param this The `ModuleContent` instance.
   * @param code The ISO code of the language to find.
   * @returns The `ContentLanguage` entity.
   */
  resolveLanguage = resolveLanguage.bind(this)

  /**
   * Given an UUID, find the `ContentCategory` entity that matches the UUID.
   *
   * @param this The `ModuleContent` instance.
   * @param id The UUID of the category to find.
   * @returns The `ContentCategory` entity.
   */
  resolveCategory = resolveCategory.bind(this)
}
