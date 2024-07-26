import { ModuleIcon } from '../index'

/**
 * Given an icon name, download the icon from the configured CDN and
 * store it using the `Asset` module. The icon is then returned as an
 * `Asset` entity. If the icon is already stored, it is returned directly.
 *
 * @param name The name of the icon to resolve.
 * @returns The `Asset` entity of the icon.
 */
export async function resolveIcon(this: ModuleIcon, name?: string | null) {
  if (!name) return

  // --- Find the icon in the database.
  const { Icon } = this.entities
  const icon = await Icon.findOne({
    where: { name },
    relations: { collection: true },
  })

  // --- If the icon is not found, throw an error.
  if (!icon) throw this.errors.ICON_NOT_FOUND(name)
  return icon
}
