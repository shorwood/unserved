import { Column, Entity, JoinTable, ManyToMany } from 'typeorm'
import { Metadata } from '@unserved/server'
import { UserRole } from './UserRole'
import { User } from './User'

/**
 * A `UserGroup` is a group of users. It can be used to assign roles to multiple users at once
 * and manage the permissions of the users in the group. For example, a group can be created for
 * a department in a company, or an organization in a community. The group can have a name, a
 * description, and a list of users.
 */
@Entity({ name: 'UserGroup' })
export class UserGroup extends Metadata {

  /**
   * Name of the group. It is unique and used to identify the group.
   */
  @Column('varchar', { unique: true, length: 255 })
    name: string

  /**
   * The slug of the group. It is used to generate a unique URL for the group.
   * The slug is generated from the name of the group by replacing spaces with
   * hyphens and converting the text to lowercase. For example, the group name
   * "Sales Department" will have the slug "sales-department".
   */
  @Column('varchar', { unique: true, length: 255 })
    slug: string

  /**
   * Description of the group. It is used to describe the purpose of the group.
   * For example, the group can be used to manage the permissions of the users
   * in the group, or to assign roles to the users in the group.
   */
  @Column('text', { default: '' })
    description: string

  /**
   * List of users in the group. The users in the group can have different roles
   * and permissions. The group can be used to manage the permissions of the users
   * in the group, or to assign roles to the users in the group.
   */
  @ManyToMany(() => User, user => user.groups)
    users?: User[]

  /**
   * Role(s) of the group. It is used to determine what the users can do in the application.
   * For example, a customer can only view the products and place orders. An employee can
   * view the products, place orders, and manage the inventory. An administrator can do
   * everything.
   *
   * @example ['a1b2c3d4-e5f6-1a0b-c1d0-abcdef012345']
   */
  @JoinTable({ name: 'UserGroup_Roles' })
  @ManyToMany(() => UserRole)
    roles?: UserRole[]
}
