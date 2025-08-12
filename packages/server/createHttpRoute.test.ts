import type { HttpRouteOptions } from './createHttpRoute'
import { createHttpRoute } from './createHttpRoute'
import { isHttpRoute } from './utils'

describe('createHttpRoute', () => {
  const handler = vi.fn()
  const options: HttpRouteOptions = {
    name: 'GET /my-route',
    parseQuery: (value: unknown) => value,
    parseBody: (value: unknown) => value,
    parseFormData: (value: unknown) => value,
    parseParameters: (value: unknown) => value,
  }

  it('should create a WebSocket route with the given options and handlers', () => {
    const route = createHttpRoute(options, handler)
    expect(route).toMatchObject({ ...options, handler })
  })

  it('should match true for isWebSocketRoute', () => {
    const route = createHttpRoute(options, handler)
    const result = isHttpRoute(route)
    expect(result).toBe(true)
  })
})
