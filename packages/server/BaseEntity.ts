import { MaybePromise } from '@unshared/types'
import { randomUUID, UUID } from 'node:crypto'
import 'reflect-metadata'
import { BeforeSoftRemove, BeforeUpdate, Column, DeleteDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { transformerDate } from './utils'

@Entity()
export class BaseEntity {

  /**
   * Unique identifier of the record. This is the primary key and is generated automatically.
   * It allows to uniquely identify the record and efficiently query the database.
   *
   * @example 'c0d1a0b0-1a0b-0c1d-d0e1-abcdef012345'
   */
  @PrimaryGeneratedColumn('uuid')
  readonly id: UUID = randomUUID()

  /**
   * The date at which the record was created. This is automatically set when the record is created.
   * It allows to track when the record was created and improves auditability.
   *
   * @example '2022-01-01T00:00:00.000Z'
   */
  @Column('varchar', { transformer: transformerDate, length: 255 })
  readonly createdAt = new Date()

  /**
   * The date at which the record was last updated. This is automatically set when the record is updated.
   * It allows to track when the record was last updated and improves auditability.
   *
   * @example '2022-01-01T00:00:00.000Z'
   */
  @Column('varchar', { transformer: transformerDate, length: 255 })
  updatedAt = new Date()

  /**
   * The date at which the record was soft-deleted. This is automatically set when the record is soft-deleted.
   * It allows to track when the record was soft-deleted and improves auditability.
   *
   * @example '2022-01-01T00:00:00.000Z'
   */
  @DeleteDateColumn({ transformer: transformerDate, nullable: true, type: 'varchar' })
  deletedAt?: Date

  /**
   * Automatically set the `deletedAt` field when the record is soft-deleted. This is used to track when the record
   * was soft-deleted and improves auditability.
   */
  @BeforeSoftRemove()
  beforeSoftRemove() {
    this.deletedAt = new Date()
  }

  /**
   * Automatically set the `updatedAt` field when the record is updated. This is used to track when the record was
   * last updated and improves auditability.
   */
  @BeforeUpdate()
  beforeUpdate() {
    this.updatedAt = new Date()
  }

  /**
   * Return the record as a plain object. This is used to serialize the record and send it over the network.
   * It usually omits the internal fields such as `id`, `createdAt`, `updatedAt`, etc and discards hidden fields
   * such as passwords, tokens, etc.
   *
   * @returns The record as a plain object.
   */
  serialize?(...args: unknown[]): MaybePromise<unknown>
}
