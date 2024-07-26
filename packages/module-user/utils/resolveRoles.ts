import { In } from 'typeorm'
import { ModuleUser } from '../index'
import { UserRole } from '../entities'

/**
 * Given a list of ids, resolve the roles and return the list of `Role` entities.
 *
 * @param ids List of role ids.
 * @returns List of `Role` entities.
 */
export async function resolveRoles(this: ModuleUser, ids?: string[] | null): Promise<UserRole[]> {
  const { UserRole } = this.entities
  if (!ids) return []
  if (ids.length === 0) return []
  return await UserRole.findBy({ id: In(ids) })
}
