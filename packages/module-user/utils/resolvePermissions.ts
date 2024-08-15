import type { ModuleUser } from '../index'

/**
 * Given a list of permission names, this function resolves the permissions and returns
 * the list of permissions. If a permission does not exist, it creates a new permission
 * with the given name.
 *
 * @param names List of permission names.
 * @returns List of permissions.
 */
export function resolvePermissions(this: ModuleUser, names?: null | string[]): string[] {
  if (!names) return []
  if (names.length === 0) return []

  return this.getApplication().modules
    .flatMap(module => Object.values(module.permissions))
    .filter(permission => names.includes(permission.id))
    .map(permission => permission.id)
}
