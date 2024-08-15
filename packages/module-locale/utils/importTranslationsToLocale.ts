import type { Locale } from '../entities'
import type { ModuleLocale } from '../index'

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
export async function importTranslationsToLocale(this: ModuleLocale, code: string, translations: Record<string, string>): Promise<Locale> {
  const { Locale, LocaleTranslation } = this.entities
  const locale = await Locale.findOne({ where: { code }, relations: { translations: true } })
  if (!locale) throw this.errors.LOCALE_NOT_FOUND(code)

  // --- Import the translations and append them to the locale.
  for (const [key, value] of Object.entries(translations)) {
    let translation = locale.translations?.find(translation => translation.key === key)
    if (!translation) translation = LocaleTranslation.create()
    translation.locale = locale
    translation.key = key
    translation.value = value
    locale.translations = locale.translations ?? []
    locale.translations.push(translation)
  }

  // --- Return the locale.
  return locale
}
