/* eslint-disable sonarjs/no-undefined-argument */
import { transformerJson } from './transformerJson'

describe('transformerJson', () => {
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
      const result = transformerJson.to(undefined)
      expect(result).toBeUndefined()
    })
  })
})
