import type { WebSocketRouteOptions } from '../createWebSocketRoute'
import { SYMBOL_WS_ROUTE } from '../createWebSocketRoute'

/**
 * Check if the value is a WebSocket route.
 *
 * @param value The value to check.
 * @returns `true` if the value is a WebSocket route, `false` otherwise.
 * @example isWebSocketRoute({ name: 'WS /chat', onMessage: () => {} }) // => true
 */
export function isWebSocketRoute(value: unknown): value is WebSocketRouteOptions {
  return typeof value === 'object'
    && value !== null
    && SYMBOL_WS_ROUTE in value
    && value[SYMBOL_WS_ROUTE] === true
}
