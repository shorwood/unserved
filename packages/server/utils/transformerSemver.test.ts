/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Semver } from '@unshared/string/createSemver'
import { transformerSemver } from './transformerSemver'

describe('transformerSemver', () => {
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
})
