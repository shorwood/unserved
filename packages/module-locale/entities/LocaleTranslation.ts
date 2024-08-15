import { Metadata } from '@unserved/server'
import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm'
import { Locale } from './Locale'

/**
 * A `LocaleTranslation` is a translation of a string in a specific language. It is used to
 * translate the strings of the website into multiple languages and allow the users to view
 * the website in their preferred language.
 */
@Entity({ name: 'LocaleTranslation' })
@Unique('locale_translation_key', ['locale', 'key'])
export class LocaleTranslation extends Metadata {

  /**
   * The key of the string. It is used to identify the string and allow the website owner to
   * reference the string in the code. The key must be unique for each string of the website.
   *
   * @example 'home.title'
   */
  @Column('varchar', { length: 255 })
  key: string

  /**
   * The value of the string. It is used as the default content of the string and displayed
   * when the translation of the string is not available in the user's preferred language.
   * The value can be a plain text, HTML, or a placeholder for dynamic content.
   *
   * @example 'Welcome to our website!'
   */
  @Column('text')
  value: string

  /**
   * The language of the string. It is used to determine the language of the string and allow
   * the website owner to create multiple versions of the string in different languages.
   *
   * @example Locale { ... }
   */
  @JoinColumn()
  @ManyToOne(() => Locale, locale => locale.translations, { onDelete: 'CASCADE' })
  locale: Locale
}
