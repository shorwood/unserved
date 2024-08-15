import type { UserRole } from '../entities'
import type { ModuleUser } from '../index'
import { In } from 'typeorm'

/**
 * Given a list of ids, resolve the roles and return the list of `Role` entities.
 *
 * @param ids List of role ids.
 * @returns List of `Role` entities.
 */
export async function resolveRoles(this: ModuleUser, ids?: null | string[]): Promise<UserRole[]> {
  const { UserRole } = this.entities
  if (!ids) return []
  if (ids.length === 0) return []
  return await UserRole.findBy({ id: In(ids) })
}
