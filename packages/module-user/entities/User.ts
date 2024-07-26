import { Column, Entity, JoinTable, ManyToMany, OneToOne } from 'typeorm'
import { UUID } from 'node:crypto'
import { Metadata, transformerJson } from '@unserve/server'
import { ContactPerson, ContactPersonObject } from '@unserve/module-contact/entities'
import { UserRole, UserRoleObject } from './UserRole'
import { PasswordOptions, createPassword } from '../utils/createPassword'

export interface UserObject {
  id?: UUID
  username: string
  createdAt: string
  updatedAt: string
  roles?: UserRoleObject[]
  profile?: ContactPersonObject
}

/**
 * A user of the application. It can be a customer, an employee, an administrator, etc.
 * Each user has a unique email address and a password. The password is hashed before
 * being stored in the database.
 *
 * The user can have one or more roles. The role is used to determine what the user can
 * do in the application. For example, a customer can only view the products and place
 * orders. An employee can view the products, place orders, and manage the inventory.
 * An administrator can do everything.
 */
@Entity({ name: 'User' })
export class User extends Metadata {

  /**
   * Flag to check if the user is the super-administrator. It is used to allow the user
   * to access the application without any restrictions. It also prevents the user from
   * being disabled or deleted.
   */
  @Column('boolean', { nullable: true, unique: true })
    isAdministrator?: boolean

  /**
   * Flag to check if the user is enabled or disabled. It is used to prevent the user
   * from logging in or accessing the application while still keeping the user data.
   */
  @Column('boolean', { default: true })
    isEnabled: boolean

  /**
   * Email or username address of the user. It is unique and used to login.
   */
  @Column('varchar', { unique: true, length: 255 })
    username: string

  /**
   * Hashed password of the user.
   */
  @Column('varchar', { length: 255, nullable: true })
    password?: string

  /**
   * The options used to hash the current password of the user.
   */
  @Column('text', { transformer: transformerJson, nullable: true })
    passwordOptions?: PasswordOptions

  /**
   * TOTP secret of the user.
   */
  @Column('varchar', { length: 255, nullable: true })
    totpSecret?: string

  /**
   * TOTP options of the user.
   */
  @Column('text', { transformer: transformerJson, nullable: true })
    totpOptions?: PasswordOptions

  /**
   * A reference to the `ContactPerson` entity. It is used to store the contact information
   * of the user. It can be the name, email, phone number, etc.
   *
   * @example ContactPerson { ... }
   */
  @OneToOne(() => ContactPerson, contactPerson => contactPerson.user)
    profile?: ContactPerson

  /**
   * Role(s) of the user. It is used to determine what the user can do in the application.
   * For example, a customer can only view the products and place orders. An employee can
   * view the products, place orders, and manage the inventory. An administrator can do
   * everything.
   *
   * @example ['a1b2c3d4-e5f6-1a0b-c1d0-abcdef012345']
   */
  @JoinTable({ name: 'User_Roles' })
  @ManyToMany(() => UserRole)
    roles?: UserRole[]

  /**
   * @returns The permissions of the user. It is a combination of all the permissions
   * of the roles the user has. It is used to determine what the user can do in the
   * application.
   */
  get permissions(): string[] | undefined {
    return this.roles?.flatMap(role => role.permissions)
  }

  /**
   * Check if the user has the given permission.
   *
   * @param permission The permission to check.
   * @returns True if the user has the permission, false otherwise.
   */
  hasPermission(permission: string): boolean {
    if (!this.permissions) throw new Error('Cannot check permissions without roles being loaded')
    return this.permissions?.includes(permission)
  }

  /**
   * Set the password of the user and hash it before setting it.
   *
   * @param password New password of the user.
   * @returns The user with the new password set.
   */
  async setPassword(password: string): Promise<void> {
    const { hash, options } = await createPassword(password)
    this.password = hash
    this.passwordOptions = options
  }

  /**
   * Check if the password of the user is correct.
   *
   * @param password Password to check.
   * @returns True if the password is correct, false otherwise.
   */
  async checkPassword(password: string): Promise<boolean> {
    const { hash } = await createPassword(password, this.passwordOptions)
    return this.password === hash
  }

  /**
   * Return a copy if the exposed properties of the user. It is used to send the user
   * data to the client without exposing sensitive information.
   *
   * @returns The user data.
   */
  serialize(): UserObject {
    return {
      id: this.id,
      username: this.username,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      roles: this.roles?.map(role => role.serialize()),
      profile: this.profile?.serialize(),
    }
  }
}

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* v8 ignore start */
if (import.meta.vitest) {
  const { DataSource } = await import('typeorm')

  interface Context {
    dataSource: InstanceType<typeof DataSource>
    User: typeof User
    UserRole: typeof UserRole
  }

  // eslint-disable-next-line vitest/no-done-callback
  beforeEach<Context>(async(context: Context) => {
    vi.useFakeTimers()
    const dataSource = new DataSource({
      type: 'sqlite',
      database: ':memory:',
      entities: [User, UserRole],
      synchronize: true,
    })
    await dataSource.initialize()
    context.dataSource = dataSource
    context.User = User
    context.UserRole = UserRole
  })

  describe('entity', () => {
    it('should create a new user', () => {
      const user = new User()
      expect(user).toMatchObject({
        id: expect.stringMatching(/[\da-f-]{36}/),
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    })

    it('should hash and set the password of the user', async() => {
      const user = new User()
      await user.setPassword('password')
      expect(user.password).toBeTypeOf('string')
    })

    it('should hash and store the options used to hash the password', async() => {
      const user = new User()
      await user.setPassword('password')
      expect(user.passwordOptions).toMatchObject({
        N: 16384,
        r: 8,
        p: 1,
        algorithm: 'scrypt',
        encoding: 'hex',
        keylen: 32,
        maxmem: 67108864,
        salt: expect.stringMatching(/[\da-f]{64}/),
      })
    })

    it('should check if the password is correct', async() => {
      const user = new User()
      await user.setPassword('password')
      const result = await user.checkPassword('password')
      expect(result).toBeTruthy()
    })
  })
}
