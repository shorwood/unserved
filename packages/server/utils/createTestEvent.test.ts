import { getHeaders, getRequestIP, H3Event } from 'h3'
import { createTestEvent } from './createTestEvent'

describe('createTestEvent', () => {
  describe('instance', () => {
    it('should create an instance of H3Event', () => {
      const event = createTestEvent()
      expect(event).toBeInstanceOf(H3Event)
    })
  })

  describe('headers', () => {
    it('should create an event with no headers', () => {
      const event = createTestEvent()
      const headers = getHeaders(event)
      expect(headers).toEqual({})
    })

    it('should create an event with custom headers', () => {
      const event = createTestEvent({ headers: { 'X-Test': '1' } })
      const headers = getHeaders(event)
      expect(headers).toEqual({ 'x-test': '1' })
    })
  })

  describe('method', () => {
    it('should create an event with the GET method', () => {
      const event = createTestEvent()
      expect(event.method).toBe('GET')
    })

    it('should create an event with the POST method', () => {
      const event = createTestEvent({ method: 'POST' })
      expect(event.method).toBe('POST')
    })
  })

  describe('remoteAddress', () => {
    it('should create an event with the default remote address', () => {
      const event = createTestEvent()
      const address = getRequestIP(event)
      expect(address).toBe('127.0.0.1')
    })

    it('should create an event with a custom remote address', () => {
      const event = createTestEvent({ remoteAddress: '0.0.0.0' })
      const address = getRequestIP(event)
      expect(address).toBe('0.0.0.0')
    })
  })
})
