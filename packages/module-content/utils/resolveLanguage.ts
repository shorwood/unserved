import { ModuleContent } from '../index'

/**
 * Given an code, find the `ContentLanguage` entity that matches the ISO code.
 * If the language does not exist, throw an error.
 *
 * @param this The `ModuleContent` instance.
 * @param code The ISO code of the language to find.
 * @returns The `ContentLanguage` entity.
 */
export async function resolveLanguage(this: ModuleContent, code?: string | null) {
  const { ContentLanguage } = this.entities

  // @TODO: Return default language if the ISO code is not provided.
  if (!code) return

  // --- Find the language by the ISO code.
  return await ContentLanguage.findOne({ where: { code } }) ?? undefined
}
