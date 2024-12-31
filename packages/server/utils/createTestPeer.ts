import type { Peer } from 'crossws'

interface Options {
  url?: string
  headers?: Record<string, string>
  remoteAddress?: string
}

/**
 * Create a mock `crossws` Peer for testing.
 *
 * @param options The options to create the event with.
 * @returns The created H3 event.
 */
export function createTestPeer(options: Options = {}): Peer {
  const { url = 'http://localhost', headers = {}, remoteAddress = '127.0.0.1' } = options
  const request = new Request(url, { headers })
  return { request, remoteAddress } as Peer
}
