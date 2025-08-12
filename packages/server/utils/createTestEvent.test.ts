/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { getHeaders, getRequestIP, H3Event, readBody, readRawBody } from 'h3'
import { createTestEvent } from './createTestEvent'

describe('createTestEvent', () => {
  describe('instance', () => {
    it('should create an instance of H3Event', () => {
      const event = createTestEvent()
      expect(event).toBeInstanceOf(H3Event)
    })
  })

  describe('url', () => {
    it('should create an event with the default URL', () => {
      const event = createTestEvent()
      expect(event.node.req.url).toStrictEqual('/')
    })

    it('should create an event with a custom URL', () => {
      const event = createTestEvent({ url: '/custom' })
      expect(event.node.req.url).toStrictEqual('/custom')
    })
  })

  describe('method', () => {
    it('should create an event with the GET method', () => {
      const event = createTestEvent()
      expect(event.method).toStrictEqual('GET')
    })

    it('should create an event with the POST method', () => {
      const event = createTestEvent({ method: 'POST' })
      expect(event.method).toStrictEqual('POST')
    })
  })

  describe('body', () => {
    it('should create an event with no body', async() => {
      const event = createTestEvent({ method: 'POST' })
      const body = await readBody(event) as unknown
      expect(body).toBeUndefined()
    })

    it('should create an event with a string body', async() => {
      const event = createTestEvent({ method: 'POST', body: 'Hello, World!' })
      const body = await readRawBody(event)
      expect(body).toStrictEqual('Hello, World!')
    })

    it('should create an event with a JSON object body', async() => {
      const event = createTestEvent({ method: 'POST', body: { key: 'value' } })
      const body = await readBody(event) as Record<string, unknown>
      expect(body).toEqual({ key: 'value' })
    })
  })

  describe('formData', () => {
    it('should create an event with no form data', async() => {
      const event = createTestEvent({ method: 'POST' })
      const body = await readBody(event) as unknown
      expect(body).toBeUndefined()
    })

    it('should create an event with an empty form data', async() => {
      const event = createTestEvent({ method: 'POST', formData: {} })
      const body = await readBody(event) as string
      expect(body).toStrictEqual('------WebKitFormBoundary--\r\n')
    })

    it('should create an event with a multipart form data', async() => {
      const event = createTestEvent({ method: 'POST', formData: { key: 'value' } })
      const body = await readBody(event) as string
      expect(body).toStrictEqual('------WebKitFormBoundary\r\nContent-Disposition: form-data; name="key"\r\n\r\nvalue\r\n------WebKitFormBoundary--\r\n')
    })

    it('should set the content-type header for multipart form data', () => {
      const event = createTestEvent({ method: 'POST', formData: { key: 'value' } })
      expect(event.node.req.headers['content-type']).toBeDefined()
      expect(event.node.req.headers['content-type']).toStrictEqual('multipart/form-data; boundary=----WebKitFormBoundary')
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

  describe('remoteAddress', () => {
    it('should create an event with the default remote address', () => {
      const event = createTestEvent()
      const address = getRequestIP(event)
      expect(address).toStrictEqual('127.0.0.1')
    })

    it('should create an event with a custom remote address', () => {
      const event = createTestEvent({ remoteAddress: '0.0.0.0' })
      const address = getRequestIP(event)
      expect(address).toStrictEqual('0.0.0.0')
    })
  })
})
