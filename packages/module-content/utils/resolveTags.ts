import { toKebabCase } from '@unshared/string/toKebabCase'
import { ModuleContent } from '../index'
import { ContentTag } from '../entities'

/**
 * Given a list of strings, find the `ContentTag` entities that match the slugs.
 * If the tag does not exist, create and save the missing tags.
 *
 * @param this The `ModuleContent` instance.
 * @param tags The list of tags to find or create.
 * @returns The `ContentTag` entities.
 */
export async function resolveTags(this: ModuleContent, tags?: string[] | null) {
  const { ContentTag } = this.entities
  const results: ContentTag[] = []
  if (!tags) return results

  // --- Find or create the tags.
  for (const tag of tags) {
    const slug = toKebabCase(tag)
    const tagEntity = await ContentTag.findOne({ where: { slug } })

    // --- If the tag exists, add it to the results.
    if (tagEntity) {
      results.push(tagEntity)
    }

    // --- Otherwise, create and save the tag.
    else {
      const newTag = ContentTag.create()
      newTag.name = slug
      newTag.slug = slug
      await newTag.save()
      results.push(newTag)
    }
  }

  // --- Return the tags.
  return results
}
