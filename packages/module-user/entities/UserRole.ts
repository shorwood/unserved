import { Column, Entity } from 'typeorm'
import { Metadata, transformerJson } from '@unserved/server'

/**
 * The user role object returned to the client. It is used to send the user role data to
 * the client without exposing sensitive information.
 */
export interface UserRoleObject {
  id: string
  name: string
  description?: string
  permissions: string[]
  updatedAt: string
  createdAt: string
}

/**
 * A role is used to determine what a user can do in the application. For example, a
 * customer can only view the products and place orders. An employee can view the
 * products, place orders, and manage the inventory. An administrator can do everything.
 *
 * Each role has a unique name and a list of permissions. The permissions are used to
 * determine what the user can do in the application.
 */
@Entity({ name: 'UserRole' })
export class UserRole extends Metadata {

  /**
   * Name of the role. It is unique and used to identify the role. It defines a set of
   * permissions that can be assigned to a user. For example, the role 'admin' can be
   * assigned to a user and gives him all the permissions.
   *
   * @example 'Administrator'
   */
  @Column('varchar', { length: 255 })
    name: string

  /**
   * Description of the role. It is a short text that describes the role and its
   * permissions. It is used to help the user understand what the role can do.
   *
   * @example 'Administrator of the application'
   */
  @Column('text', { default: '' })
    description: string

  /**
   * Permissions of the role. It is a string that contains a list of permissions separated
   * by a comma. For example, 'read,write,delete' means that the user can read, write, and
   * delete the data.
   */
  @Column('text', { transformer: transformerJson, default: '[]' })
    permissions: string[]

  /**
   * @returns The list of permissions of the role.
   */
  serialize(): UserRoleObject {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      permissions: this.permissions,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    }
  }
}
