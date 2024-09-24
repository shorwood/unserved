import { Icon } from '@unserved/module-icon'
import { BaseEntity } from '@unserved/server'
import { UUID } from 'node:crypto'
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne } from 'typeorm'
import { ContentCategory } from './ContentCategory'
import { ContentPage } from './ContentPage'

interface SerializeOptions {
  withIconData?: boolean
}

export interface ContentTagObject {
  id: UUID
  name: string
  slug: string
  iconUrl: string | undefined
  createdAt: string
  updatedAt: string
}

/**
 * Tags are used to categorize the pages of the website and allow the users to filter
 * the pages by tags.
 */
@Entity({ name: 'ContentTag' })
export class ContentTag extends BaseEntity {

  /**
   * The display name of the tag. It is used as the title of the tag in the filter
   * and the search engine results.
   *
   * @example 'Web Development'
   */
  @Column('varchar', { length: 255 })
  name: string

  /**
   * The slug of the tag. It is used as the URL of the tag in the filter and the search
   * engine results. It also helps deduplicate the tags and allow the users to search
   * the tags by their slugs.
   */
  @Column('varchar', { length: 255, unique: true })
  slug: string

  /**
   * A reference to the icon of the tag. It should be an iconify icon that represents
   * the tag in the filter and the search engine results.
   *
   * @example Icon {...}
   */
  @JoinColumn()
  @ManyToOne(() => Icon, { nullable: true, onDelete: 'SET NULL' })
  icon?: Icon

  /**
   * The pages of the tag. It is used to link the tag to the pages of the website and
   * allow the users to filter the pages by tags.
   *
   * @example [ContentPage {...}, ContentPage {...}]
   */
  @JoinTable({ name: 'ContentTag_Pages' })
  @ManyToMany(() => ContentPage, page => page.tags)
  pages?: ContentPage[]

  /**
   * The categories of the tag. It is used to link the tag to the categories of the website and
   * allow the users to filter the categories by tags.
   *
   * @example [ContentPage {...}, ContentPage {...}]
   */
  @JoinTable({ name: 'ContentTag_Categories' })
  @ManyToMany(() => ContentCategory, category => category.tags)
  categories?: ContentCategory[]

  /**
   * @param options The options to serialize the entity with.
   * @returns The object representation of the entity.
   */
  serialize(options: SerializeOptions = {}): ContentTagObject {
    return {
      id: this.id,
      name: this.name,
      slug: this.slug,
      iconUrl: options.withIconData ? this.icon?.svg : this.icon?.url,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    }
  }
}
