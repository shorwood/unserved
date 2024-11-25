import type { ValueTransformer } from 'typeorm'
import { createSemver, Semver } from '@unshared/string/createSemver'

/**
 * Transform the field value to a sementic version string when saving it to the database
 * and into a `Semver` instance when reading it from the database. This is used to
 * store sementic versions in the database as strings and read them as `Semver` instances.
 *
 * @example
 * export class Entity extends BaseEntity {
 * **@Column('varchar', { transformer: transformerSemver, length: 255 })
 *     version: Semver
 * }
 */
export const transformerSemver: ValueTransformer = {
  to(value?: unknown): string | undefined {
    if (value instanceof Semver) return value.toString()
  },
  from(value?: unknown): Semver | undefined {
    if (typeof value === 'string') return createSemver(value)
  },
}
