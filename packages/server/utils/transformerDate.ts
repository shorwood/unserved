/* eslint-disable unicorn/no-null */
import type { ValueTransformer } from 'typeorm'

/**
 * Transform the field value to a date when saving it to the database
 * and from a date when reading it from the database. This is used to
 * store dates in the database as strings and read them as dates.
 *
 * @example
 * export class Entity extends BaseEntity {
 * **@Column('varchar', { transformer: transformerDate, length: 255 })
 *     createdAt: Date
 * }
 */
export const transformerDate = {
  to(value?: Date | null): null | string {
    if (value instanceof Date === false) return null
    return value.toISOString()
  },
  from(value?: null | string): Date | undefined {
    if (typeof value !== 'string') return undefined
    return new Date(value)
  },
} satisfies ValueTransformer
