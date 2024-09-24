import { StorageFile } from '@unserved/module-storage'
import { BaseEntity, ModuleBase, transformerJson } from '@unserved/server'
import { UUID } from 'node:crypto'
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne } from 'typeorm'
import { Form, FormObject } from './Form'

interface SerializeOptions {
  withIconData?: boolean
  withImageData?: boolean
  withBannerData?: boolean
  withForm?: boolean
}

export interface FormSubmissionObject {
  id?: UUID
  content: Record<string, string>
  assetUrls?: string[]
  updatedAt: string
  createdAt: string
  form?: FormObject
}

/**
 * A `FormSubmission` entity corresponds to a form submitted by a visitor on the website.
 * It contains the information submitted by the visitor, such as the name, the email, the phone
 * number, the message, and the company. All the fields are optional except the name and the email.
 */
@Entity({ name: 'FormSubmission' })
export class FormSubmission extends BaseEntity {

  /**
   * A reference to the form definition that was submitted.
   */
  @JoinColumn()
  @ManyToOne(() => Form)
  form?: Form

  /**
   * The submitted content of the form.
   *
   * @example { 'message': 'Hello, world!' }
   */
  @Column('text', { transformer: transformerJson })
  content: Record<string, string>

  /**
   * The assets uploaded by the visitor who submitted the form.
   *
   * @example 'file.pdf'
   */
  @JoinTable({ name: 'FormSubmission_StorageFile' })
  @ManyToMany(() => StorageFile)
  assets?: StorageFile[]

  /**
   * @param module The module that the entity belongs to.
   * @param options The options used to serialize the entity.
   * @returns The serialized form submission entity.
   */
  async serialize(module: ModuleBase, options: SerializeOptions = {}): Promise<FormSubmissionObject> {
    const { withForm = false, ...serializeOptions } = options
    return {
      id: this.id,
      content: this.content,
      assetUrls: this.assets?.map(asset => asset.url),
      updatedAt: this.updatedAt.toISOString(),
      createdAt: this.createdAt.toISOString(),
      form: withForm ? await this.form?.serialize(module, serializeOptions) : undefined,
    }
  }
}
