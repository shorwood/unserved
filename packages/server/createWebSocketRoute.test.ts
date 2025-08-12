import type { WebSocketRouteOptions } from './createWebSocketRoute'
import { createWebSocketRoute } from './createWebSocketRoute'
import { isWebSocketRoute } from './utils'

describe('createWebSocketRoute', () => {
  const options: WebSocketRouteOptions = {
    name: 'WS /my-route',
    parseQuery: (value: unknown) => value,
    parseClientMessage: (value: unknown) => value,
  }
  const handlers = {
    onOpen: vi.fn(),
    onMessage: vi.fn(),
    onClose: vi.fn(),
    onError: vi.fn(),
  }

  it('should create a WebSocket route with the given options and handlers', () => {
    const route = createWebSocketRoute(options, handlers)
    expect(route).toMatchObject({ ...options, ...handlers })
  })

  it('should match true for isWebSocketRoute', () => {
    const route = createWebSocketRoute(options, handlers)
    const result = isWebSocketRoute(route)
    expect(result).toBe(true)
  })
})
