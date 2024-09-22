/* eslint-disable unicorn/no-null */
import type { ParserLike, ParserResult } from '@unshared/validation'
import { createParser } from '@unshared/validation'

export interface ValueTransformerTyped<T> {
  to(value?: unknown): T | undefined
  from(value?: unknown): unknown
}

/**
 * Create a TypeORM transformer from a set of parser rules. This is used to
 * transform and validate values when saving them to the database. It does not
 * transform the value when reading it from the database.
 *
 * @param rules The parser rules to use.
 * @returns The TypeORM transformer.
 * @example
 *
 * // Create a transformer from a single parser rule
 * const transformer = transformerFromParser(assertStringEmail)
 *
 * // Apply the transformer to a field in a TypeORM entity
 * export class User {
 *   \@Column('varchar', { transformer })
 *   email: string
 * }
 */
export function transformerFromParser<T extends ParserLike>(...rules: T): ValueTransformerTyped<ParserResult<T>> {
  const parse = createParser(...rules)
  return {
    to(value?: unknown) {
      if (value !== null && value !== undefined)
        return parse(value)
    },
    from(value?: unknown) {
      return value
    },
  } as ValueTransformerTyped<ParserResult<T>>
}

/* v8 ignore start */
if (import.meta.vitest) {
  const { assertStringEmail } = await import('@unshared/validation')
  const { toUpperCase } = await import('@unshared/string')

  describe('from', () => {
    it('should return the value as is', () => {
      const result = transformerFromParser(assertStringEmail).from('value')
      expect(result).toBe('value')
    })

    it('should return null when the value is null', () => {
      const result = transformerFromParser(assertStringEmail).from(null)
      expect(result).toBeNull()
    })
  })

  describe('to', () => {
    it('should parse the value and return it as is', () => {
      const result = transformerFromParser(assertStringEmail).to('john.doe@acme.com')
      expect(result).toBe('john.doe@acme.com')
    })

    it('should transform the value with the parser', () => {
      const result = transformerFromParser([assertStringEmail, toUpperCase]).to('john.doe@acme.com')
      expect(result).toBe('JOHN.DOE@ACME.COM')
    })

    it('should return undefined when the value is undefined', () => {
      const result = transformerFromParser(assertStringEmail).to()
      expect(result).toBeUndefined()
    })

    it('should return undefined when the value is null', () => {
      const result = transformerFromParser(assertStringEmail).to(null)
      expect(result).toBeUndefined()
    })

    it('should throw an error when the value is invalid', () => {
      const shouldThrow = () => transformerFromParser(assertStringEmail).to('invalid')
      expect(shouldThrow).toThrow('Expected value to be an email but received: invalid')
    })
  })
}
