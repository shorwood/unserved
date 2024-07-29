/* eslint-disable unicorn/no-useless-undefined */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable unicorn/no-null */
import { ValueTransformer } from 'typeorm'

/**
 * Transform the field value to a date when saving it to the database
 * and from a date when reading it from the database. This is used to
 * store dates in the database as strings and read them as dates.
 *
 * @example
 * export class Metadata extends BaseEntity {
 * **@Column('varchar', { transformer: transformerDate, length: 255 })
 *     createdAt: Date
 * }
 */
export const transformerDate: ValueTransformer = {
  to(value?: Date | null): string | null {
    if (value instanceof Date === false) return null
    return value.toISOString()
  },
  from(value?: string | null): Date | undefined {
    if (typeof value !== 'string') return undefined
    return new Date(value)
  },
}

/* v8 ignore start */
if (import.meta.vitest) {
  describe('from', () => {
    it('should transform a date to a string', () => {
      const date = new Date(0).toISOString()
      const result = transformerDate.from(date) as Date
      const expected = new Date(0)
      expect(result).toStrictEqual(expected)
    })

    it('should return undefined when the value is null', () => {
      const result = transformerDate.from(null)
      expect(result).toBeUndefined()
    })

    it('should return undefined when the value is not a string', () => {
      const result = transformerDate.from(0 as unknown as string)
      expect(result).toBeUndefined()
    })
  })

  describe('to', () => {
    it('should transform a string to a date', () => {
      const date = new Date(0)
      const result = transformerDate.to(date)
      const expected = date.toISOString()
      expect(result).toStrictEqual(expected)
    })

    it('should return null when the value is undefined', () => {
      const result = transformerDate.to(undefined)
      expect(result).toBeNull()
    })

    it('should return null when the value is not a date', () => {
      const result = transformerDate.to('not a date' as unknown as Date)
      expect(result).toBeNull()
    })
  })
}
