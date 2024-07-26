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
  to(value?: Date) { return value ? value.toISOString() : null },
  from(value?: string) { return value ? new Date(value) : undefined },
}

/* v8 ignore start */
if (import.meta.vitest) {
  describe('from', () => {
    it('should transform a date to a string', () => {
      const date = new Date(0).toISOString()
      const result = transformerDate.from(date) as Date
      const expected = new Date(0)
      expect(result).toMatchObject(expected)
    })

    it('should return undefined when the value is null', () => {
      const result = transformerDate.from(null)
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
  })
}
