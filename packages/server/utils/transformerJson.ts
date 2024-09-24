import type { ValueTransformer } from 'typeorm'

/**
 * Transforms a JSON object to a string when saving it to the database
 * and from a string to a JSON object when reading it from the database.
 * This is used to store JSON objects in the database as strings and read them as JSON objects.
 *
 * @example
 * export class Entity extends BaseEntity {
 * **@Column('json', { transformer: transformerJson, nullable: true })
 *    passwordOptions: PasswordOptions
 * }
 */
export const transformerJson = {
  to(value?: unknown): string | undefined {
    if (typeof value === 'object' && value !== null)
      return JSON.stringify(value)
  },
  from(value?: unknown): unknown {
    if (typeof value !== 'string') return
    try { return JSON.parse(value) as unknown }
    catch { return }
  },
} satisfies ValueTransformer

/* v8 ignore start */
/* eslint-disable unicorn/no-null */
if (import.meta.vitest) {
  describe('from', () => {
    it('should transform a JSON string to a JSON object', () => {
      const json = JSON.stringify({ key: 'value' })
      const result = transformerJson.from(json)
      expect(result).toStrictEqual({ key: 'value' })
    })

    it('should return undefined when the value is undefined', () => {
      const result = transformerJson.from()
      expect(result).toBeUndefined()
    })

    it('should return undefined when the value is null', () => {
      const result = transformerJson.from(null)
      expect(result).toBeUndefined()
    })
  })

  describe('to', () => {
    it('should transform a JSON object to a JSON string', () => {
      const json = { key: 'value' }
      const result = transformerJson.to(json)
      expect(result).toBe('{"key":"value"}')
    })

    it('should return undefined when the value is null', () => {
      const result = transformerJson.to(null)
      expect(result).toBeUndefined()
    })

    it('should return undefined when the value is undefined', () => {
      // eslint-disable-next-line unicorn/no-useless-undefined
      const result = transformerJson.to(undefined)
      expect(result).toBeUndefined()
    })
  })
}
