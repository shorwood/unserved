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
