import { Icon } from '@unserved/module-icon'
import { StorageFile } from '@unserved/module-storage'
import { BaseEntity, ModuleBase } from '@unserved/server'
import { UUID } from 'node:crypto'
import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany } from 'typeorm'
import { ContentPage, ContentPageObject } from './ContentPage'
import { ContentTag, ContentTagObject } from './ContentTag'

interface SerializeOptions {
  withIconData?: boolean
  withImageData?: boolean
  withBannerData?: boolean
}

export interface ContentCategoryObject {
  id: UUID
  name: string
  slug: string
  description: string
  createdAt: string
  updatedAt: string
  iconUrl?: string
  imageUrl?: string
  bannerUrl?: string
  tags?: ContentTagObject[]
  pages?: ContentPageObject[]
}

/**
 * The cagories of the website content. It is used to categorize the pages of the
 * website and allow the users to filter the pages by categories.
 */
@Entity({ name: 'ContentCategory' })
export class ContentCategory extends BaseEntity {

  /**
   * The display name of the category. It is used as the title of the category in the
   * navigation menu and the search engine results.
   *
   * @example 'Tutorials'
   */
  @Column('varchar', { length: 255 })
  name: string

  /**
   * The slug of the category. It is used to generate the URL of the category and allow
   * the website owner to create custom URLs for the categories of the website.
   * The slug must be unique for each category of the website.
   *
   * @example 'tutorials'
   */
  @Column('varchar', { length: 255 })
  slug: string

  /**
   * The description of the category. It is used to describe the category in the
   * navigation menu and the search engine results.
   *
   * @example 'Learn how to build a website from scratch.'
   */
  @Column('text')
  description: string

  /**
   * A reference to the icon of the category. It should be an iconify icon that represents
   * the category in the navigation menu and the search engine results.
   *
   * @example Icon {...}
   */
  @JoinColumn()
  @ManyToOne(() => Icon, { nullable: true, onDelete: 'SET NULL' })
  icon?: Icon

  /**
   * A 1/1 aspect ratio image that represents the page. It is used as the preview image
   * of the category in the search engine results and the social media previews of the category.
   * If not provided, the image of the category is used.
   */
  @JoinColumn()
  @ManyToOne(() => StorageFile, { nullable: true, onDelete: 'SET NULL' })
  image?: StorageFile

  /**
   * The banner image of the category. It is used as the background image of the category header
   * and the banner of the category. If not provided, the banner image of the category is used.
   */
  @JoinColumn()
  @ManyToOne(() => StorageFile, { nullable: true, onDelete: 'SET NULL' })
  banner?: StorageFile

  /**
   * The tags of the category. It is used to categorize the pages of the website and allow
   * the users to filter the pages by tags.
   *
   * @example [ContentPageTag {...}, ContentPageTag {...}]
   */
  @ManyToMany(() => ContentTag, tag => tag.pages)
  tags?: ContentTag[]

  /**
   * The pages of the category. It is used to display the pages of the category in the
   * navigation menu and the search engine results.
   *
   * @example [ContentPage {...}, ContentPage {...}]
   */
  @OneToMany(() => ContentPage, page => page.category)
  pages?: ContentPage[]

  /**
   * Get the URL or the SVG of the icon.
   *
   * @param asSvg Whether to return the icon as an SVG string.
   * @returns The URL or the SVG of the icon.
   */
  iconUrl(asSvg = false): string | undefined {
    if (!this.icon) return
    return asSvg ? this.icon.svg: this.icon.url
  }

  /**
   * Download the image data of the category and return it as a base64 URL.
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
   * Download the banner data of the category and return it as a base64 URL.
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
   * Serialize all pages of the category with the given options.
   *
   * @param module The module to resolve the relations.
   * @param options The options to serialize the entity.
   * @returns The object representation of the entity.
   */
  async serializePages(module: ModuleBase, options: SerializeOptions = {}) {
    const pagesPromises = this.pages?.map(page => page.serialize(module, options)) ?? []
    const pages = await Promise.all(pagesPromises)

    // --- Remove the redundant data from the pages.
    for (const page of pages) {
      page.sections = undefined
      page.category = undefined
    }

    // --- Return the pages.
    return pages
  }

  /**
   * @param module The module to resolve the relations.
   * @param options The options to serialize the entity.
   * @returns The object representation of the entity.
   */
  async serialize(module: ModuleBase, options: SerializeOptions = {}): Promise<ContentCategoryObject> {
    const [imageUrl, bannerUrl, pages] = await Promise.all([
      this.imageUrl(module, options.withImageData),
      this.bannerUrl(module, options.withBannerData),
      this.serializePages(module, options),
    ])

    return {
      id: this.id,
      name: this.name,
      slug: this.slug,
      description: this.description,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      iconUrl: this.iconUrl(options.withIconData),
      imageUrl,
      bannerUrl,
      tags: this.tags?.map(tag => tag.serialize()),
      pages,
    }
  }
}
