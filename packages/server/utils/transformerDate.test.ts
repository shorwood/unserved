/* eslint-disable sonarjs/no-undefined-argument */
import { transformerDate } from './transformerDate'

describe('transformerDate', () => {
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
})
