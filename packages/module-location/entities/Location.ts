import { Metadata } from '@unserved/server'
import { Column, Entity } from 'typeorm'

/**
 * An `Location` entity is used to determine the location of a profile, a user, a company,
 * or the delivery address of an order. It contains the street, the city, the region,
 * the postal code, and the country of the location. All the fields are optional.
 *
 * The fields are broad to accommodate all the possible locations around the world.
 * For example, the postal code is not required in some countries, the region is not
 * required in some cities, and the country is not required in some regions.
 */
@Entity({ name: 'Location' })
export class Location extends Metadata {

  /**
   * The latitude of the address.
   *
   * @example 37.7749
   */
  @Column('float')
  latitude?: number

  /**
   * The longitude of the address.
   *
   * @example -122.4194
   */
  @Column('float')
  longitude?: number

  /**
   * The unique external ID of the location. It is used to deduplicate the locations
   * when geo-coding the addresses.
   */
  @Column('varchar', { length: 255, nullable: true, unique: true })
  externalId?: string

  /**
   * The street of the address.
   *
   * @example '123 Main St.'
   */
  @Column('varchar', { length: 255, nullable: true })
  address?: string

  /**
   * The city of the address.
   *
   * @example 'Springfield'
   */
  @Column('varchar', { length: 255, nullable: true })
  city?: string

  /**
   * The region of the address.
   *
   * @example 'Illinois'
   */
  @Column('varchar', { length: 255, nullable: true })
  region?: string

  /**
   * The postal code of the address.
   *
   * @example '12345'
   */
  @Column('varchar', { length: 32, nullable: true })
  postalCode?: string

  /**
   * The country of the address.
   *
   * @example 'United States'
   */
  @Column('varchar', { length: 255, nullable: true })
  country?: string

  /**
   * @returns The full address of the location.
   */
  get fullAddress(): string {
    return [this.address, this.city, this.region, this.postalCode, this.country]
      .filter(Boolean)
      .join(', ')
  }

  /**
   * @returns The serialized representation of the location.
   */
  serialize(): LocationObject {
    return {
      latitude: this.latitude,
      longitude: this.longitude,
      externalId: this.externalId,
      address: this.address,
      city: this.city,
      region: this.region,
      postalCode: this.postalCode,
      country: this.country,
      fullAddress: this.fullAddress,
    }
  }
}

export interface LocationObject {
  latitude?: number
  longitude?: number
  externalId?: string
  address?: string
  city?: string
  region?: string
  postalCode?: string
  country?: string
  fullAddress: string
}
