import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm'
import { Metadata, transformerDate, transformerJson } from '@unserved/server'
import { ContentPage } from './ContentPage'
import { ContentLanguage } from './ContentLanguage'

export interface ContentPageSection {
  kind: string
  value: Record<string, unknown>
}

/**
 * The page of a website is used to store the information about the page such as
 * the SEO metadata and the content of the page. It is versionned to allow the
 * website owner to revert to a previous version of the page if needed.
 */
@Entity({ name: 'ContentPageContent' })
export class ContentPageContent extends Metadata {

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
  @Column('varchar', { length: 255 })
    slug: string

  /**
   * The description of the page. It is used as the description of the page in the
   * search engine results.
   *
   * @example 'The best products in the world.'
   */
  @Column('text', { default: '' })
    description: string

  /**
   * The sections of the page. It is used to display the content of the page to the
   * users and allow the website owner to edit the content of the page.
   */
  @Column('text', { transformer: transformerJson })
    sections: ContentPageSection[] = []

  /**
   * The date at which the page was published. It can be in the future to schedule
   * a publication at a later date or be undefined to keep the page as a draft.
   */
  @Column('varchar', { transformer: transformerDate, nullable: true })
    publishedAt?: Date

  /**
   * The language used in the content of the page. It is used to translate the content
   * of the page to different languages and allow the website owner to create a
   * multilingual website.
   */
  @JoinColumn()
  @ManyToOne(() => ContentLanguage, { nullable: true, onDelete: 'CASCADE' })
    language?: ContentLanguage

  /**
   * A reference to the page of the website. It is used to link the version to the
   * page and allow the website owner to revert to a previous version of the page
   * if needed.
   */
  @JoinColumn()
  @OneToOne(() => ContentPage, content => content.content, { onDelete: 'CASCADE' })
    page: ContentPage
}
