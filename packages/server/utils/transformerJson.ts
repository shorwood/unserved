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
