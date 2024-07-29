import { ModuleLocale } from '../index'

/**
 * Given an code, find the `Locale` entity that matches the ISO code.
 * If the language does not exist, return the default language.
 *
 * @param code The ISO code of the language to find.
 * @returns The `Locale` entity.
 */
export async function resolveLocale(this: ModuleLocale, code?: string | null) {
  const { Locale } = this.entities

  // --- Find the language by the ISO code.
  if (code) {
    const locale = await Locale.findOneBy({ code })
    if (!locale) throw this.errors.LOCALE_NOT_FOUND(code)
    return locale
  }

  // --- Return the default language if the ISO code is not provided.
  const locale = await Locale.findOneBy({ isDefault: true })
  if (locale) return locale

  // --- If the default language is not found, create a new one.
  const defaultLocale = Locale.create()
  defaultLocale.isDefault = true
  defaultLocale.name = 'English'
  defaultLocale.code = 'en-US'
  return await defaultLocale.save()
}
