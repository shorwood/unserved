import { toUppercase } from '@unshared/string'
import { assertStringEmail } from '@unshared/validation/assert'
import { transformerFromParser } from './transformerFromParser'

describe('transformerFromParser', () => {
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
      const result = transformerFromParser([assertStringEmail, toUppercase]).to('john.doe@acme.com')
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
      expect(shouldThrow).toThrow('String is not an email.')
    })
  })
})
