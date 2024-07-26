import { Column, Entity, JoinColumn, JoinTable, ManyToOne, OneToMany } from 'typeorm'
import { Metadata, transformerDate } from '@unserve/server'
import { StorageFile } from '@unserve/module-storage'
import { EmailAddress } from './EmailAddress'

/**
 * An `EmailMessage` entity corresponds to an email message. It contains the subject,
 * the body, the attachments, the sender, the recipients, the CC, the BCC, the reply-to,
 * an all the relative metadata of the email message.
 */
@Entity({ name: 'EmailMessage' })
export class EmailMessage extends Metadata {

  /**
   * The unique identifier of the email message entity. It allows to identify the email
   * when it is stored in a remote location or when it is referenced in another entity.
   */
  @Column('varchar', { length: 255, unique: true })
    etag: string

  /**
   * The subject of the email message.
   *
   * @example 'Hello'
   */
  @Column('varchar', { length: 255 })
    subject: string

  /**
   * The body of the email message.
   *
   * @example 'Hello, World!'
   */
  @Column('text')
    body: string

  /**
   * Date and time when the email message was sent.
   *
   * @example '2021-01-01T00:00:00.000Z'
   */
  @Column('varchar', { length: 255, transformer: transformerDate })
    sentAt: Date

  /**
   * Date and time when the email message was received.
   *
   * @example '2021-01-01T00:00:00.000Z'
   */
  @Column('varchar', { length: 255, transformer: transformerDate })
    receivedAt: Date

  /**
   * The attachments of the email message. It can be a file, an image, a document, etc.
   * It is used to send additional files with the email message.
   */
  @JoinTable({ name: 'EmailMessage_Attachments' })
  @OneToMany(() => StorageFile, storageFile => storageFile, { cascade: true })
    attachments?: StorageFile[]

  /**
   * A reference to the `EmailAddress` entity that sent the email message. It corresponds
   * to the `From` field of the email.
   */
  @JoinColumn()
  @ManyToOne(() => EmailAddress, email => email.sent, { cascade: true })
    from: EmailAddress

  /**
   * The recipients of the email message. It corresponds to the `To` field of the email.
   */
  @JoinTable({ name: 'EmailMessage_To' })
  @OneToMany(() => EmailAddress, email => email.received, { cascade: true })
    to: EmailAddress[]

  /**
   * The CC of the email message. It corresponds to the `CC` field of the email.
   * It is used to send a copy of the email to the recipients.
   */
  @JoinTable({ name: 'EmailMessage_CC' })
  @OneToMany(() => EmailAddress, email => email.received, { cascade: true })
    cc?: EmailAddress[]

  /**
   * The BCC of the email message. It corresponds to the `BCC` field of the email.
   * It is used to send a copy of the email to the recipients without showing the
   */
  @JoinTable({ name: 'EmailMessage_BCC' })
  @OneToMany(() => EmailAddress, email => email.received, { cascade: true })
    bcc?: EmailAddress[]

  /**
   * The reply-to of the email message. It corresponds to the `Reply-To` field of the email.
   * It is used to set the email address where the replies should be sent.
   */
  @JoinTable({ name: 'EmailMessage_ReplyTo' })
  @OneToMany(() => EmailAddress, email => email.received, { cascade: true })
    replyTo?: EmailAddress[]
}

/**
 * An `EmailConversation` entity corresponds to a chain of email messages. It contains
 * the various email messages that are part of the conversation.
 */
@Entity({ name: 'EmailConversation' })
export class EmailConversation extends Metadata {

  /**
   * The email messages that are part of the conversation.
   *
   * @example [EmailMessage { ... }, ... ]
   */
  @OneToMany(() => EmailMessage, emailMessage => emailMessage, { cascade: true, eager: true })
    messages: EmailMessage[]
}
