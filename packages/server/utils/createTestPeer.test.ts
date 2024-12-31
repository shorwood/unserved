import { createTestPeer } from './createTestPeer'

describe('createTestPeer', () => {
  it('should create a test peer with default options', () => {
    const peer = createTestPeer()
    expect(peer).toStrictEqual({
      request: new Request('http://localhost', { headers: {} }),
      remoteAddress: '127.0.0.1',
    })
  })

  it('should create a test peer with custom url', () => {
    const peer = createTestPeer({ url: 'http://example.com' })
    expect(peer).toStrictEqual({
      request: new Request('http://example.com', { headers: {} }),
      remoteAddress: '127.0.0.1',
    })
  })

  it('should create a test peer with custom headers', () => {
    const peer = createTestPeer({ headers: { 'X-Test': '1' } })
    expect(peer).toStrictEqual({
      request: new Request('http://localhost', { headers: { 'X-Test': '1' } }),
      remoteAddress: '127.0.0.1',
    })
  })

  it('should create a test peer with custom remote address', () => {
    const peer = createTestPeer({ remoteAddress: '0.0.0.0' })
    expect(peer).toStrictEqual({
      request: new Request('http://localhost', { headers: {} }),
      remoteAddress: '0.0.0.0',
    })
  })
})
