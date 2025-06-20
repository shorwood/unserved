import type { WebSocketRouteOptions } from '../createWebSocketRoute'
import { SYMBOL_WS_ROUTE } from '../createWebSocketRoute'
import { isWebSocketRoute } from './isWebSocketRoute'

describe('isWebSocketRoute', () => {
  it('should return true for valid WebSocket route', () => {
    const validRoute = { name: 'WS /chat', onMessage: () => {}, [SYMBOL_WS_ROUTE]: true }
    const result = isWebSocketRoute(validRoute)
    expect(result).toBe(true)
  })

  it('should return false for invalid WebSocket route', () => {
    const invalidRoute = { name: 'WS /chat', onMessage: () => {} }
    const result = isWebSocketRoute(invalidRoute)
    expect(result).toBe(false)
  })

  it('should return false for null value', () => {
    const result = isWebSocketRoute(null)
    expect(result).toBe(false)
  })

  it('should return false for undefined value', () => {
    const result = isWebSocketRoute(undefined)
    expect(result).toBe(false)
  })

  it('should return false for number value', () => {
    const result = isWebSocketRoute(42)
    expect(result).toBe(false)
  })

  it('should return false for string value', () => {
    const result = isWebSocketRoute('string')
    expect(result).toBe(false)
  })

  it('should return false for boolean value', () => {
    const result = isWebSocketRoute(true)
    expect(result).toBe(false)
  })

  it('should predicate a `WebSocketRoute`', () => {
    const route = {} as unknown
    const result = isWebSocketRoute(route)
    if (result) expectTypeOf(route).toEqualTypeOf<WebSocketRouteOptions>()
  })
})
