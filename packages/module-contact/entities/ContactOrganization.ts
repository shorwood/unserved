import { Column, Entity, JoinColumn, JoinTable, OneToMany, OneToOne } from 'typeorm'
import { UUID } from 'node:crypto'
import { Metadata, transformerJson } from '@unserved/server'
import { StorageFile } from '@unserved/module-storage'
import { Location, LocationObject } from '@unserved/module-location'

/** The social media links of the company. */
export interface ContactOrganizationSocial {
  type: string
  url: string
}

/**
 * A `ContactOrganization` entity corresponds to a company or an organization. It contains the
 * legal information of the company, such as the name, the registration number, the
 * tax number, the address, the phone number, the email address, the website, and the
 * logo. All the fields are optional except the name.
 */
@Entity({ name: 'ContactOrganization' })
export class ContactOrganization extends Metadata {

  /**
   * The name of the company.
   *
   * @example 'Acme Inc.'
   */
  @Column('varchar', { length: 255 })
    name: string

  /**
   * The social media links of the company. It allows to link the company to
   * the social media platforms such as Facebook, Twitter, LinkedIn, Instagram,
   * YouTube, and others.
   */
  @Column('text', { nullable: true, transformer: transformerJson })
    contactSocials?: ContactOrganizationSocial[]

  /**
   * The registration number of the company.
   *
   * @example '1234567890'
   */
  @Column('varchar', { length: 255, nullable: true })
    registrationNumber: string

  /**
   * The type of the registration number of the company.
   *
   * @example 'EIN'
   */
  @Column('varchar', { length: 255, nullable: true })
    registrationType: string

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
   * The logo of the company. It should be a square image with a transparent
   * background. It is used to represent the company in the application.
   *
   * @example StorageFile { ... }
   */
  @JoinColumn()
  @OneToOne(() => StorageFile, { cascade: true, nullable: true })
    logo?: StorageFile

  /**
   * The images and videos of the company. It allows to show the products,
   * the services, the team, the office, the branch, the events, the awards,
   *
   * @example [StorageFile { ... }, ... ]
   */
  @JoinTable()
  @OneToMany(() => StorageFile, storageFile => storageFile)
    images?: StorageFile[]

  /**
   * The address of the company. It should be the legal address of the company
   * and not the address of the office or the branch.
   */
  @OneToOne(() => Location, { cascade: true, nullable: true })
    address?: Location

  /**
   * @returns The serializable object of the organization.
   */
  serialize(): ContactOrganizationObject {
    return {
      id: this.id,
      name: this.name,
      registrationNumber: this.registrationNumber,
      registrationType: this.registrationType,
      taxNumber: this.taxNumber,
      taxType: this.taxType,
      logoUrl: this?.logo?.url,
      imageUrls: this?.images?.map(image => image.url),
      address: this?.address?.serialize(),
    }
  }
}
export interface ContactOrganizationObject {
  id?: UUID
  name: string
  registrationNumber?: string
  registrationType?: string
  taxNumber?: string
  taxType?: string
  logoUrl?: string
  imageUrls?: string[]
  address?: LocationObject
}
