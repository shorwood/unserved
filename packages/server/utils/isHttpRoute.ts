import type { HttpRouteOptions } from '../createHttpRoute'
import { SYMBOL_HTTP_ROUTE } from '../createHttpRoute'

/**
 * Check if the value is an HTTP route.
 *
 * @param value The value to check.
 * @returns `true` if the value is an HTTP route, `false` otherwise.
 * @example isHttpRoute({ name: 'GET /users', handler: () => [] }) // => true
 */
export function isHttpRoute(value: unknown): value is HttpRouteOptions {
  return typeof value === 'object'
    && value !== null
    && SYMBOL_HTTP_ROUTE in value
    && value[SYMBOL_HTTP_ROUTE] === true
}
