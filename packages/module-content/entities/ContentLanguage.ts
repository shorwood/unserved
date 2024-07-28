import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { Metadata } from '@unserved/server'
import { Icon } from '@unserved/module-icon'

interface SerializeOptions {
  withIconData?: boolean
}

export interface ContentLanguageObject {
  id: string
  name: string
  code: string
  isDefault: boolean
  isDisabled: boolean
  iconUrl?: string
  createdAt: string
  updatedAt: string
}

/**
 * Language used for the content of the page. It allows the website owner to create multiple
 * versions of the page in different languages and allow the users to switch between the
 * languages.
 */
@Entity({ name: 'ContentLanguage' })
export class ContentLanguage extends Metadata {

  /**
   * The display name of the language. It is used as the title of the language in the
   * language switcher and the search engine results.
   *
   * @example 'English'
   */
  @Column('varchar', { length: 255 })
    name: string

  /**
   * The slug of the language. It is used to generate the URL of the language and allow
   * the website owner to create custom URLs for the languages of the website.
   * The slug must be unique for each language of the website.
   *
   * @example 'en'
   */
  @Column('varchar', { length: 255, unique: true, nullable: true })
    code: string

  /**
   * Determines if the language is the default language of the website. It is used as
   * a fallback language when the content of the page is not available in the user's
   * preferred language.
   */
  @Column('boolean', { default: false })
    isDefault: boolean

  /**
   * Determines if the language is disabled. It is used to prevent the users from
   * switching to the language and allow the website owner to disable the language
   * temporarily without deleting the language.
   */
  @Column('boolean', { default: false })
    isDisabled: boolean

  /**
   * A reference to the flag of the language. It is used to display the flag of the language
   * in the language switcher and allow the users to recognize the language by its flag.
   */
  @JoinColumn()
  @ManyToOne(() => Icon, { nullable: true, onDelete: 'SET NULL' })
    icon?: Icon

  /**
   * @param options The options to serialize the entity.
   * @returns The object representation of the entity.
   */
  serialize(options: SerializeOptions = {}): ContentLanguageObject {
    return {
      id: this.id,
      name: this.name,
      code: this.code,
      isDefault: this.isDefault,
      isDisabled: this.isDisabled,
      iconUrl: options.withIconData ? this.icon?.svg : this.icon?.url,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    }
  }
}
