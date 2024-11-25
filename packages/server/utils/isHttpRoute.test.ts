import type { HttpRouteOptions } from '../createHttpRoute'
import { SYMBOL_HTTP_ROUTE } from '../createHttpRoute'
import { isHttpRoute } from './isHttpRoute'

describe('isHttpRoute', () => {
  it('should return true for valid HTTP route', () => {
    const result = isHttpRoute({ name: 'GET /users', [SYMBOL_HTTP_ROUTE]: true })
    expect(result).toBe(true)
  })

  it('should return false for invalid HTTP route', () => {
    const result = isHttpRoute({ name: 'GET /users' })
    expect(result).toBe(false)
  })

  it('should return false for null value', () => {
    const result = isHttpRoute(null)
    expect(result).toBe(false)
  })

  it('should return false for undefined value', () => {
    const result = isHttpRoute(undefined)
    expect(result).toBe(false)
  })

  it('should return false for number value', () => {
    const result = isHttpRoute(42)
    expect(result).toBe(false)
  })

  it('should return false for string value', () => {
    const result = isHttpRoute('string')
    expect(result).toBe(false)
  })

  it('should return false for boolean value', () => {
    const result = isHttpRoute(true)
    expect(result).toBe(false)
  })

  it('should predicate a `HttpRoute`', () => {
    const route = {} as unknown
    const result = isHttpRoute(route)
    if (result) expectTypeOf(route).toMatchTypeOf<HttpRouteOptions>()
  })
})
