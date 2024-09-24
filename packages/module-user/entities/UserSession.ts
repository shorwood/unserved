import { BaseEntity, transformerDate } from '@unserved/server'
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { User } from './User'

/**
 * A role is used to determine what a user can do in the application. For example, a
 * customer can only view the products and place orders. An employee can view the
 * products, place orders, and manage the inventory. An administrator can do everything.
 *
 * Each role has a unique name and a list of permissions. The permissions are used to
 * determine what the user can do in the application.
 */
@Entity({ name: 'UserSession' })
export class UserSession extends BaseEntity {

  /**
   * The owner of the session. It is used to determine who is using the session.
   *
   * @example User { ... }
   */
  @ManyToOne(() => User, user => user.sessions, { onDelete: 'CASCADE' })
  @JoinColumn()
  user?: User

  /**
   * The address of the session. It is used to bind the session to a specific device.
   *
   * @example '192.168.1.1'
   */
  @Column('varchar', { length: 255 })
  address: string

  /**
   * The user agent of the session. It is used to determine the device and browser
   * that the user is using to access the application.
   *
   * @example 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
   */
  @Column('varchar', { length: 255 })
  userAgent: string

  /**
   * Expiration date of the session. When the session expires, all subsequent requests
   * will be rejected and the user will have to login again. By default, the session
   * expires in 1 hour.
   *
   * @example '2022-12-31T23:59:59.999Z'
   */
  @Column('varchar', { transformer: transformerDate, length: 255 })
  expiresAt: Date
}
