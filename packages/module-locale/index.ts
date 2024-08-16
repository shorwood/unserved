import { ModuleIcon } from '@unserved/module-icon'
import { ModuleUser } from '@unserved/module-user'
import { ModuleBase } from '@unserved/server'
import * as ENTITIES from './entities'
import * as ROUTES from './routes'
import { ERRORS, importTranslations, importTranslationsToLocale, PERMISSIONS, resolveLocale } from './utils'

export * from './entities'

export type ModuleLocaleOptions = Partial<Pick<ModuleLocale, 'localeTranslations'>>

/**
 * The `ModuleLocale` module provides the functionality to manage the languages of the website.
 * It allows the website owner to create multiple versions of a string in different languages
 * and allow the users to view the website in their preferred language.
 */
export class ModuleLocale extends ModuleBase {
  errors = ERRORS
  routes = ROUTES
  entities = ENTITIES
  permissions = PERMISSIONS
  dependencies = [ModuleUser, ModuleIcon]

  constructor(options: ModuleLocaleOptions = {}) {
    super()
    if (options.localeTranslations) this.localeTranslations = options.localeTranslations
  }

  /**
   * The initial translations to add to the locales when the module is initialized. The translations
   * will be imported into the database when the module is initialized and the locales will be created
   * if they do not exist.
   */
  localeTranslations: Record<string, Record<string, string>> = {}

  /**
   * Given an code, find the `ContentLanguage` entity that matches the ISO code.
   * If the language does not exist, throw an error.
   *
   * @param code The ISO code of the language to find.
   * @returns The `ContentLanguage` entity.
   */
  resolveLocale = resolveLocale.bind(this)

  /**
   * Given a map of translation key and an object of translations, import the translations into the locale.
   * If the locale does not exist, create the locale and import the translations.
   *
   * @param translations The map of translation key and an object of translations to import into the locale.
   * @returns The `Locale` entities with the translations.
   * @example
   *
   * // Declare the translations to import.
   * const translations = {
   *   'home.title': {
   *     'en-US': 'Welcome to our website!',
   *     'fr-FR': 'Bienvenue sur notre site web!',
   *    },
   *    'home.description': {
   *      'en-US': 'Learn more about our products and services.',
   *      'fr-FR': 'Découvrez nos produits et services.',
   *    },
   * }
   *
   * // Import the translations into the locales.
   * const locales = await moduleLocale.importTranslations(translations)
   */
  importTranslations = importTranslations.bind(this)

  /**
   * Given a locale code and a map of translations, import the translations into the locale.
   * If the locale does not exist, throw an error.
   *
   * @param code The ISO code of the language to import the translations to.
   * @param translations The map of strings to import into the locale.
   * @returns The `Locale` entity with the translations.
   * @example
   *
   * // Declare the translations to import.
   * const translations = {
   *   'home.title': 'Welcome to our website!',
   *   'home.description': 'Learn more about our products and services.',
   * }
   *
   * // Import the translations into the locale.
   * const locale = await moduleLocale.importTranslationsToLocale('en-US', translations)
   */
  importTranslationsToLocale = importTranslationsToLocale.bind(this)

  /**
   * Initialize the module with the initial translations.
   *
   * @returns A promise that resolves when the module is initialized.
   */
  async initialize(): Promise<void> {
    const locales = await this.importTranslations(this.localeTranslations)
    await Promise.all(locales.map(locale => locale.save()))
  }
}
