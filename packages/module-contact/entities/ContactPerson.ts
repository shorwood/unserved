import { Column, Entity, JoinColumn, OneToOne } from 'typeorm'
import { UUID } from 'node:crypto'
import { Metadata } from '@unserved/server'
import { User, UserObject } from '@unserved/module-user'

/**
 * A `ContactPerson` entity corresponds to a person or an individual. It contains the
 * personal information of the person, such as the name, the email address, the phone
 * number, the job title, the photo, the social media links, and the address. All the
 * fields are optional except the name.
 */
@Entity({ name: 'ContactPerson' })
export class ContactPerson extends Metadata {

  /**
   * The full name of the person.
   *
   * @example 'John'
   */
  @Column('varchar', { length: 255 })
    firstName: string

  /**
   * The last name of the person.
   *
   * @example 'Doe'
   */
  @Column('varchar', { length: 255, default: '' })
    lastName: string

  /** @returns The full name of the person. */
  get fullName() {
    return [this.firstName, this.lastName].filter(Boolean).join(' ')
  }

  /** @returns The name of the person. If the full name is not set, it returns the username. */
  get name() {
    return this.fullName || this?.user?.username
  }

  /**
   * A reference to the `User` entity. It is used to link the person to a user account.
   * It allows the person to login to the application and perform actions.
   */
  @JoinColumn()
  @OneToOne(() => User, { cascade: true, nullable: true })
    user?: User

  /** @returns The serializable object of the person. */
  serialize(): ContactPersonObject {
    return {
      id: this.id,
      name: this.name,
      firstName: this.firstName,
      lastName: this.lastName,
      fullName: this.fullName,
      user: this?.user?.serialize(),
    }
  }
}

export interface ContactPersonObject {
  id?: UUID
  name?: string
  firstName: string
  lastName?: string
  fullName?: string
  user?: UserObject
}
