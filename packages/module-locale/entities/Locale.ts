import { Icon } from '@unserved/module-icon'
import { BaseEntity } from '@unserved/server'
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { LocaleTranslation } from './LocaleTranslation'

interface LocaleSerializeOptions {
  withCount?: boolean
  withIconData?: boolean
  withStringtable?: boolean
}

export interface LocaleObject {
  id: string
  name: string
  code: string
  isDefault: boolean
  isDisabled: boolean
  iconUrl?: string
  createdAt: string
  updatedAt: string
  count?: number
  stringtable?: Record<string, string>
}

/**
 * Language used for the content of the page. It allows the website owner to create multiple
 * versions of the page in different locales and allow the users to switch between them.
 */
@Entity({ name: 'Locale' })
export class Locale extends BaseEntity {

  /**
   * The display name of the locale. It is used as the title of the locale in the
   * locale switcher and the search engine results.
   *
   * @example 'English'
   */
  @Column('varchar', { length: 255 })
  name: string

  /**
   * The slug of the locale. It is used to generate the URL of the locale and allow
   * the website owner to create custom URLs for the locales of the website.
   * The slug must be unique for each locale of the website.
   *
   * @example 'en-US'
   */
  @Column('varchar', { length: 255, unique: true, nullable: true })
  code: string

  /**
   * Determines if the locale is the default locale of the website. It is used as
   * a fallback locale when the content of the page is not available in the user's
   * preferred locale.
   */
  @Column('boolean', { unique: true })
  isDefault: boolean

  /**
   * Determines if the locale is disabled. It is used to prevent the users from
   * switching to the locale and allow the website owner to disable the locale
   * temporarily without deleting the locale.
   */
  @Column('boolean', { default: false })
  isDisabled: boolean

  /**
   * A reference to the flag of the locale. It is used to display the flag of the locale
   * in the locale switcher and allow the users to recognize the locale by its flag.
   */
  @JoinColumn()
  @ManyToOne(() => Icon, { nullable: true, onDelete: 'SET NULL' })
  icon?: Icon

  /**
   * List of translations of the locale. It is used to translate the strings of the website
   * into multiple locales and allow the users to view the website in their preferred locale.
   * The translations can be created for the strings of the website, the content of the page, and
   * the metadata of the page.
   *
   * @example [LocaleTranslation { ... }]
   */
  @OneToMany(() => LocaleTranslation, translation => translation.locale, { cascade: true })
  translations?: LocaleTranslation[]

  /**
   * @returns A map of the translations of the locale.
   */
  get stringtable(): Record<string, string> {
    const entries = this.translations?.map(translation => [translation.key, translation.value]) ?? []
    return Object.fromEntries(entries) as Record<string, string>
  }

  /**
   * @param options The options to serialize the entity.
   * @returns The object representation of the entity.
   */
  serialize(options: LocaleSerializeOptions = {}): LocaleObject {
    return {
      id: this.id,
      name: this.name,
      code: this.code,
      isDefault: this.isDefault,
      isDisabled: this.isDisabled,
      iconUrl: options.withIconData ? this.icon?.svg : this.icon?.url,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      stringtable: options.withStringtable ? this.stringtable : undefined,
      count: options.withCount ? this.translations?.length ?? 0 : undefined,
    }
  }
}
