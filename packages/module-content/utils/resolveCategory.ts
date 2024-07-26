import { UUID } from 'node:crypto'
import { ModuleContent } from '../index'

/**
 * Given an UUID, find the `ContentCategory` entity that matches the UUID.
 *
 * @param this The `ModuleContent` instance.
 * @param id The UUID of the category to find.
 * @returns The `ContentCategory` entity.
 */
export async function resolveCategory(this: ModuleContent, id?: UUID | null) {
  const { ContentCategory } = this.entities
  if (!id) return

  // --- Find the category by the UUID.
  return await ContentCategory.findOne({ where: { id } }) ?? undefined
}
