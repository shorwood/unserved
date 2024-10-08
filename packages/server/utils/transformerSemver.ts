import type { ValueTransformer } from 'typeorm'
import { createSemver, Semver } from '@unshared/string'

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

/* v8 ignore start */
/* eslint-disable unicorn/no-null */
/* eslint-disable unicorn/no-useless-undefined */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
if (import.meta.vitest) {
  describe('from', () => {
    it('should transform a Semver to a string', () => {
      const version = new Semver({ major: 1, minor: 0, patch: 0 })
      const result = transformerSemver.to(version)
      expect(result).toBe('1.0.0')
    })

    it('should return undefined when the value is null', () => {
      const result = transformerSemver.from(null)
      expect(result).toBeUndefined()
    })

    it('should return undefined when the value is not a string', () => {
      const result = transformerSemver.from(0 as unknown as string)
      expect(result).toBeUndefined()
    })
  })

  describe('to', () => {
    it('should transform a string to a semver', () => {
      const result = transformerSemver.from('1.0.0')
      expect(result).toStrictEqual(new Semver({
        major: 1,
        minor: 0,
        patch: 0,
      }))
    })

    it('should return undefined when the value is undefined', () => {
      const result = transformerSemver.to(undefined)
      expect(result).toBeUndefined()
    })

    it('should return undefined when the value is not a semver', () => {
      const result = transformerSemver.to('not a semver' as unknown as Date)
      expect(result).toBeUndefined()
    })
  })
}
