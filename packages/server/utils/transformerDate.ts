/* eslint-disable unicorn/no-useless-undefined */
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

/* v8 ignore start */
if (import.meta.vitest) {
  describe('from', () => {
    it('should transform a date to a string', () => {
      const date = new Date(0).toISOString()
      const result = transformerDate.from(date)
      const expected = new Date(0)
      expect(result).toStrictEqual(expected)
    })

    it('should return undefined when the value is null', () => {
      const result = transformerDate.from(null)
      expect(result).toBeUndefined()
    })

    it('should return undefined when the value is not a string', () => {
      // @ts-expect-error: testing invalid input
      const result = transformerDate.from(0)
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
      // @ts-expect-error: testing invalid input
      const result = transformerDate.to('not a date')
      expect(result).toBeNull()
    })
  })
}
