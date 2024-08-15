import { Icon } from '@unserved/module-icon'
import { StorageFile } from '@unserved/module-storage'
import { Metadata, ModuleBase } from '@unserved/server'
import { UUID } from 'node:crypto'
import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany } from 'typeorm'
import { ContentCategory, ContentCategoryObject } from './ContentCategory'
import { ContentPageContent, ContentPageSection } from './ContentPageContent'
import { ContentTag, ContentTagObject } from './ContentTag'

interface SerializeOptions {
  withSections?: boolean
  withIconData?: boolean
  withImageData?: boolean
  withBannerData?: boolean
}

export interface ContentPageObject {
  id: UUID
  name: string
  slug: string
  createdAt: string
  updatedAt: string
  iconUrl?: string
  imageUrl?: string
  bannerUrl?: string
  tags?: ContentTagObject[]
  category?: ContentCategoryObject
  sections?: ContentPageSection[]
  description?: string
  localeCode?: string
}

/**
 * The page of a website is used to store the information about the page such as
 * the SEO metadata and the content of the page. It regroups the different versions
 * of the page to allow the website owner to revert to a previous version of the page
 * if needed.
 */
@Entity({ name: 'ContentPage' })
export class ContentPage extends Metadata {

  /**
   * The display name of the page. It is used as the title of the page in the header,
   * the browser tab, and the search engine results.
   *
   * @example 'How to build a website'
   */
  @Column('varchar', { length: 255 })
  name: string

  /**
   * The slug of the page. It is used to generate the URL of the page and allow the
   * website owner to create custom URLs for the pages of the website.
   * The slug must be unique for each page of the website.
   *
   * @example 'how-to-build-a-website'
   */
  @Column('varchar', { length: 255, unique: true })
  slug: string

  /**
   * The tags of the page. It is used to categorize the pages of the website and allow
   * the users to filter the pages by tags.
   *
   * @example [ContentPageTag {...}, ContentPageTag {...}]
   */
  @ManyToMany(() => ContentTag, tag => tag.pages)
  tags?: ContentTag[]

  /**
   * A reference to the icon of the page. It should be an iconify icon that represents
   * the page in the navigation menu and the search engine results.
   *
   * @example Icon {...}
   */
  @JoinColumn()
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
   * The category of the page. It is used to categorize the pages of the website and allow
   * the users to filter the pages by categories.
   *
   * @example ContentPageCategory {...}
   */
  @JoinColumn()
  @ManyToOne(() => ContentCategory, category => category.pages, { nullable: true, onDelete: 'SET NULL' })
  category?: ContentCategory

  /**
   * The versions of the page. It regroups the different versions of the page to allow
   * the website owner to revert to a previous version of the page if needed.
   * The latest version of the page is the one displayed to the users.
   */
  @OneToMany(() => ContentPageContent, version => version.page, { cascade: true })
  content: ContentPageContent[]

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
   * @param module The module to use to resolve the relations.
   * @param options The options to use to serialize the entity.
   * @returns The object representation of the entity.
   */
  async serialize(module: ModuleBase, options: SerializeOptions = {}): Promise<ContentPageObject> {
    const version = this.content?.at(-1)
    const [imageUrl, bannerUrl] = await Promise.all([
      this.imageUrl(module, options.withImageData),
      this.bannerUrl(module, options.withBannerData),
    ])

    return {
      id: this.id,
      name: this.name,
      slug: this.slug,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      iconUrl: this.iconUrl(options.withIconData),
      imageUrl,
      bannerUrl,
      tags: this.tags?.map(tag => tag.serialize()),
      category: await this.category?.serialize(module, options),
      sections: options.withSections ? version?.sections : undefined,
      description: version?.description,
      localeCode: version?.locale?.code,
    }
  }
}
