import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { Metadata, ModuleBase, transformerJson } from '@unserved/server'
import { StorageFile } from '@unserved/module-storage'

interface SerializeOptions {
  withIconData?: boolean
  withImageData?: boolean
  withBannerData?: boolean
}

export interface ContentWebsiteSocial {
  type: string
  url: string
}

export interface ContentWebsiteObject {
  id: string
  url?: string
  name: string
  description?: string
  iconUrl?: string
  imageUrl?: string
  bannerUrl?: string
  contactEmail?: string
  contactPhone?: string
  contactAddress?: string
  registrationNumber?: string
  registrationType?: string
  taxNumber?: string
  taxType?: string
  contactSocials?: ContentWebsiteSocial[]
}

/**
 * A website is the main entity of the website module. It is used to store the
 * information about the website such as the name, the description, the URL,
 * the logo, the favorite icon, the open graph image, and the legal information.
 */
@Entity({ name: 'ContentWebsite' })
export class ContentWebsite extends Metadata {

  /**
   * The display name of the website. It is used as the title of the website in
   * the header, the browser tab, and the search engine results.
   *
   * @example 'Acme Inc.'
   */
  @Column('varchar', { length: 255 })
    name: string

  /**
   * The canonical URL of the website. It is used to specify the preferred URL of
   * the website in the search engine results and allows better SEO optimization.
   *
   * @example 'https://www.acme.com'
   */
  @Column('varchar', { length: 255, nullable: true })
    url?: string

  /**
   * The description of the website. It is used as the description of the website
   * in the search engine results.
   *
   * @example 'The best products in the world.'
   */
  @Column('text', { nullable: true })
    description?: string

  /**
   * The contact email of the website. It allows the users to contact the website
   * owner for any questions or inquiries.
   */
  @Column('varchar', { length: 255, nullable: true })
    contactEmail?: string

  /**
   * The phone number of the website. It allows the users to contact the website
   * owner by phone for any questions or inquiries.
   */
  @Column('varchar', { length: 255, nullable: true })
    contactPhone?: string

  /**
   * The contact address of the website. It allows the users to contact the website
   * owner by mail for any questions or inquiries.
   */
  @Column('varchar', { length: 255, nullable: true })
    contactAddress?: string

  /**
   * The social media links of the company. It allows to link the company to
   * the social media platforms such as Facebook, Twitter, LinkedIn, Instagram,
   * YouTube, and others.
   */
  @Column('text', { nullable: true, transformer: transformerJson })
    contactSocials?: ContentWebsiteSocial[]

  /**
   * The registration number of the company.
   *
   * @example '1234567890'
   */
  @Column('varchar', { length: 255, nullable: true })
    registrationNumber?: string

  /**
   * The type of the registration number of the company.
   *
   * @example 'EIN'
   */
  @Column('varchar', { length: 255, nullable: true })
    registrationType?: string

  /**
   * The tax number of the company.
   *
   * @example '123-45-6789'
   */
  @Column('varchar', { length: 255, nullable: true })
    taxNumber?: string

  /**
   * The type of the tax number of the company.
   *
   * @example 'VAT'
   */
  @Column('varchar', { length: 255, nullable: true })
    taxType?: string

  /**
   * The favorite icon of the website as displayed in the browser tab and the bookmarks.
   * The favorite icon should be a square image with a size of 16x16 pixels or 32x32 pixels.
   */
  @JoinColumn()
  @ManyToOne(() => StorageFile, { nullable: true })
    icon?: StorageFile

  /**
   * The logo of the website as displayed in the header and the footer of the website.
   */
  @JoinColumn()
  @ManyToOne(() => StorageFile, { nullable: true })
    image?: StorageFile

  /**
   * The banner of the website as displayed in the header of the website.
   */
  @JoinColumn()
  @ManyToOne(() => StorageFile, { nullable: true })
    banner?: StorageFile

  /**
   * Download the image data of the page and return it as a base64 URL.
   *
   * @param module The module to use to download the image data.
   * @param asBase64 Whether to return the image as a base64 URL.
   * @returns The base64 URL of the image.
   */
  async iconUrl(module: ModuleBase, asBase64 = false): Promise<string | undefined> {
    if (!this.icon) return
    if (!asBase64) return this.icon.url
    const data = await this.icon.download(module)
    return await data.base64url()
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
    const data = await this.image.download(module)
    return await data.base64url()
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
    const data = await this.banner.download(module)
    return await data.base64url()
  }

  /**
   * @param module The module to use to download the image and banner data.
   * @param options The options to use to serialize the entity.
   * @returns The object representation of the entity.
   */
  async serialize(module: ModuleBase, options: SerializeOptions = {}): Promise<ContentWebsiteObject> {
    const [iconUrl, imageUrl, bannerUrl] = await Promise.all([
      this.iconUrl(module, options.withIconData),
      this.imageUrl(module, options.withImageData),
      this.bannerUrl(module, options.withBannerData),
    ])

    return {
      id: this.id,
      url: this.url,
      name: this.name,
      description: this.description,
      iconUrl,
      imageUrl,
      bannerUrl,
      contactEmail: this.contactEmail,
      contactPhone: this.contactPhone,
      contactAddress: this.contactAddress,
      registrationNumber: this.registrationNumber,
      registrationType: this.registrationType,
      taxNumber: this.taxNumber,
      taxType: this.taxType,
      contactSocials: this.contactSocials,
    }
  }
}
