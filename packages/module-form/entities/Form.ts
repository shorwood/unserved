import { Icon } from '@unserved/module-icon'
import { StorageFile } from '@unserved/module-storage'
import { Metadata, ModuleBase, transformerJson } from '@unserved/server'
import { UUID } from 'node:crypto'
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { FormSubmission, FormSubmissionObject } from './FormSubmission'

interface SerializeOptions {
  withIconData?: boolean
  withImageData?: boolean
  withBannerData?: boolean
}

export interface FormFieldValue {
  label: string
  value: string
  description?: string
}

export interface FormField {
  name: string
  type: string
  description?: string
  placeholder?: string

  // number
  maxValue?: number
  minValue?: number
  step?: number

  // file
  maxSize?: number
  accept?: string

  isMultiple?: boolean
  isRequired?: boolean
  defaultValue?: unknown
  values?: FormFieldValue[]
}

export interface FormObject {
  id: UUID
  name: string
  slug: string
  fields?: FormField[]
  description: string
  iconUrl?: string
  imageUrl?: string
  bannerUrl?: string
  updatedAt: string
  createdAt: string
  submissions?: FormSubmissionObject[]
}

/**
 * A website form is a form that can be filled by the visitors of the website.
 * It is used to collect information from the visitors such as the name, the email,
 * the phone number, the message, and the company. The form can be customized with
 * additional fields and the information submitted by the visitors is stored in the
 * `WebsiteFormSubmission` entity.
 */
@Entity({ name: 'Form' })
export class Form extends Metadata {

  /**
   * The name of the form as displayed in the website.
   *
   * @example 'Contact form'
   */
  @Column('varchar', { length: 255 })
  name: string

  /**
   * The slug of the form used in the code.
   *
   * @example 'contact-form'
   */
  @Column('varchar', { length: 255, unique: true })
  slug: string

  /**
   * The description of the form as displayed in the website.
   *
   * @example 'Contact us for more information.'
   */
  @Column('text', { default: '' })
  description: string

  /**
   * A reference to the icon of the form.
   *
   * @example Icon { ... }
   */
  @ManyToOne(() => Icon, { nullable: true, onDelete: 'SET NULL' })
  icon?: Icon

  /**
   * A 1/1 aspect ratio image that represents the page. It is used as the preview image
   * of the page in the search engine results and the social media previews of the page.
   * If not provided, the image of the category is used.
   */
  @JoinColumn()
  @ManyToOne(() => StorageFile, { nullable: true, onDelete: 'SET NULL' })
  image?: StorageFile

  /**
   * The banner image of the page. It is used as the background image of the page header
   * and the banner of the page. If not provided, the banner image of the category is used.
   */
  @JoinColumn()
  @ManyToOne(() => StorageFile, { nullable: true, onDelete: 'SET NULL' })
  banner?: StorageFile

  /**
   * The fields of the form as displayed in the website.
   */
  @Column('text', { transformer: transformerJson, default: '[]' })
  fields?: FormField[]

  /**
   * The submissions assigned to the form. The submissions are the form data filled by the
   * visitors of the website when they submit the form.
   */
  @OneToMany(() => FormSubmission, submission => submission.form)
  submissions?: FormSubmission[]

  /**
   * Get the URL or the SVG of the icon.
   *
   * @param asSvg Whether to return the icon as an SVG string.
   * @returns The URL or the SVG of the icon.
   */
  iconUrl(asSvg = false): string | undefined {
    if (!this.icon) return
    return asSvg ? this.icon.svg : this.icon.url
  }

  /**
   * Download the image data of the page and return it as a base64 URL.
   *
   * @param module The module to use to download the image data.
   * @param asBase64 Whether to return the image as a base64 URL.
   * @returns The base64 URL of the image.
   */
  async imageUrl(module: ModuleBase, asBase64 = false): Promise<string | undefined> {
    if (!this.image) return
    if (!asBase64) return this.image.url
    const imageData = await this.image.download(module)
    return await imageData.base64url()
  }

  /**
   * Download the banner data of the page and return it as a base64 URL.
   *
   * @param module The module to use to download the banner data.
   * @param asBase64 Whether to return the banner as a base64 URL.
   * @returns The base64 URL of the banner.
   */
  async bannerUrl(module: ModuleBase, asBase64 = false): Promise<string | undefined> {
    if (!this.banner) return
    if (!asBase64) return this.banner.url
    const bannerData = await this.banner.download(module)
    return await bannerData.base64url()
  }

  /**
   * Get all the submissions of the form.
   *
   * @param module The module to use to fetch the submissions.
   * @param options The options to customize the serialization.
   * @returns The submissions of the form.
   */
  async getSubmissions(module: ModuleBase, options: SerializeOptions = {}): Promise<FormSubmissionObject[]> {
    if (!this.submissions) return []
    return Promise.all(
      this.submissions.map(x => x.serialize(module, { withForm: true, ...options })),
    )
  }

  /**
   * Serialize the form entity into a plain object.
   *
   * @param module The module to use to download the image data.
   * @param options The options to customize the serialization.
   * @returns The serialized form entity.
   */
  async serialize(module: ModuleBase, options: SerializeOptions = {}): Promise<FormObject> {
    const [imageUrl, bannerUrl, submissions] = await Promise.all([
      this.imageUrl(module, options.withImageData),
      this.bannerUrl(module, options.withBannerData),
      this.getSubmissions(module),
    ])

    return {
      id: this.id,
      name: this.name,
      slug: this.slug,
      fields: this.fields,
      description: this.description,
      iconUrl: this.iconUrl(options.withIconData),
      imageUrl,
      bannerUrl,
      updatedAt: this.updatedAt.toISOString(),
      createdAt: this.createdAt.toISOString(),
      submissions,
    }
  }
}
