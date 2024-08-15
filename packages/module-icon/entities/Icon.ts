import { Metadata } from '@unserved/server'
import { UUID } from 'node:crypto'
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { IconCollection } from './IconCollection'

export interface IconObject {
  id: UUID
  url: string
  svg?: string
  name: string
}

/**
 * Icons are used to embellish the website content and allow the users to recognize
 * the content by its icon. The icons data are stored as assets in the asset module.
 */
@Entity({ name: 'Icon' })
export class Icon extends Metadata {

  /**
   * The name of the icon. It is a string that represents the icon in the iconify
   * CDN and is made up of the icon collection and the icon name separated by a colon.
   *
   * @example 'mdi:web'
   */
  @Column('varchar', { length: 255, unique: true })
  name: string

  /**
   * The inner body of the icon. It is the SVG data of the icon that is used to
   * display the icon in the website content.
   *
   * @example '<path fill="currentColor" d="..."/>'
   */
  @Column('text')
  body?: string

  /**
   * If `true`, the icon is used as a sample when presenting the icons sets.
   *
   * @default false
   */
  @Column('boolean', { default: false })
  isSample: boolean

  /**
   * The collection from which the icon is taken. It is used to group the icons by their
   * sets and allow the users to search the icons by their sets.
   */
  @JoinColumn()
  @ManyToOne(() => IconCollection, collection => collection.icons, { onDelete: 'CASCADE' })
  collection: IconCollection

  /**
   * Get the URL of the icon.
   *
   * @returns The URL of the icon.
   */
  get url() {
    return `/api/icons/${this.name}`
  }

  /**
   * Download the icon data of the page and return it as an SVG string.
   *
   * @returns The SVG string of the icon.
   */
  get svg(): string {
    if (!this.collection) throw new Error('Could not download icon SVG, The `collection` relation is not loaded.')
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${this.collection.width} ${this.collection.height}">${this.body}</svg>`
  }

  /**
   * @param withSvg If `true`, include the SVG data of the icon.
   * @returns The object representation of the icon.
   */
  serialize(withSvg = false): IconObject {
    return {
      id: this.id,
      url: this.url,
      svg: withSvg ? this.svg : undefined,
      name: this.name,
    }
  }
}
