import type { EventHandler } from 'h3'
import type { Route } from '../types'
import { createHttpEventHandler } from './createHttpEventHandler'
import { createWebSocketEventHandler } from './createWebSocketEventHandler'
import { isHttpRoute } from './isHttpRoute'
import { isWebSocketRoute } from './isWebSocketRoute'

/**
 * Given a route, create an event handler that can be used to handle a specific
 * HTTP request. The event handler reads the body, query, and parameters of the
 * request, validates them, and then calls the handler with the context.
 *
 * @param route The route to create the event handler for.
 * @returns The event handler that can be used to handle the request.
 * @example createEventHandler({ method: 'GET', path: '/users', callback: () => [] })
 */
export function createEventHandler<T extends Route>(route: T): EventHandler {
  if (isHttpRoute(route)) return createHttpEventHandler(route)
  if (isWebSocketRoute(route)) return createWebSocketEventHandler(route)
  throw new Error('The provided route is neither an HTTP route nor a WebSocket route.')
}
