import { Column, Entity, OneToMany } from 'typeorm'
import { Metadata, transformerJson } from '@unserved/server'
import { Icon } from './Icon'
import { IconCollectionMetadata } from '../utils'

export interface IconCollectionObject extends IconCollectionMetadata {
  slug: string
  isInstalled: boolean
}

/**
 * The set of icons. It is used to group the icons by their sets and allow the users
 * to search the icons by their sets.
 */
@Entity({ name: 'IconCollection' })
export class IconCollection extends Metadata {

  /**
   * The name of the set. It is used to identify the set and allow the users to search
   * the icons by their sets.
   *
   * @example 'Material Design Icons'
   */
  @Column('varchar', { length: 255 })
    name: string

  /**
   * The slug of the set. It is used to identify the set in the URL and allow the users
   * to search the icons by their sets.
   *
   * @example 'mdi'
   */
  @Column('varchar', { length: 255, unique: true })
    slug: string

  /**
   * The width of the set. It is used to generate the SVG of the icons.
   *
   * @example 24
   */
  @Column('int')
    width: number

  /**
   * The height of the set. It is used to generate the SVG of the icons.
   *
   * @example 24
   */
  @Column('int')
    height: number

  /**
   * The metadata of the set. It is used to provide additional information about the set
   * such as the author, the license, the category, the height, and the palette.
   */
  @Column('text', { transformer: transformerJson })
    metadata: IconCollectionMetadata

  /**
   * The icons of the set. It is used to link the set to the icons and allow the users
   * to search the icons by their sets.
   *
   * @example [Icon {...}, Icon {...}]
   */
  @OneToMany(() => Icon, icon => icon.collection, { cascade: true })
    icons: Icon[]

  /**
   * @returns The serialized collection object.
   */
  serialize(): IconCollectionObject {
    return {
      ...this.metadata,
      name: this.name,
      slug: this.slug,
      isInstalled: true,
    }
  }
}
