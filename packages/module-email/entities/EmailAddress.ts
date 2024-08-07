import { Column, Entity, OneToMany } from 'typeorm'
import { Metadata } from '@unserved/server'
import { EmailMessage } from './EmailMessage'

/**
 * An `EmailAddress` entity corresponds to an email address. It contains the email
 * address and can be linked to a person, a company, or an organization. It is used
 * to store the contact information of the entity.
 */
@Entity({ name: 'EmailAddress' })
export class EmailAddress extends Metadata {

  /**
   * The email address of the entity.
   *
   * @example 'john.doe@acme.com'
   */
  @Column('varchar', { length: 255, unique: true })
    email: string

  /**
   * The message send by this email address.
   *
   * @example EmailMessage { ... }
   */
  @OneToMany(() => EmailMessage, emailMessage => emailMessage.from)
    sent?: EmailMessage[]

  /**
   * The messages received by this email address.
   *
   * @example [EmailMessage { ... }, ... ]
   */
  @OneToMany(() => EmailMessage, emailMessage => emailMessage.to)
    received?: EmailMessage[]
}
