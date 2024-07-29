import { ModuleLocale } from '../index'
import { Locale } from '../entities'

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
export async function importTranslations(this: ModuleLocale, translations: Record<string, Record<string, string>>): Promise<Locale[]> {
  const { Locale, LocaleTranslation } = this.entities
  const locales = new Map<string, Locale>()

  // --- Import the translations.
  for (const [key, values] of Object.entries(translations)) {
    for (const [code, value] of Object.entries(values)) {

      // --- Find or create the locale by the code.
      let locale = locales.get(code)
      if (!locale) locale = await Locale.findOne({ where: { code }, relations: { translations: true } }) ?? undefined
      if (!locale) locale = Locale.create({ code })
      locales.set(code, locale)

      // --- Create the translation and append it to the locale.
      let translation = locale.translations?.find(translation => translation.key === key)
      if (!translation) translation = LocaleTranslation.create()
      translation.locale = locale
      translation.key = key
      translation.value = value
      locale.translations = [...locale.translations ?? []]
      locale.translations.push(translation)
    }
  }

  // --- Return the locales.
  return [...locales.values()]
}
