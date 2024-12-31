import type { FetchMethod, RequestOptions } from '@unshared/client/utils'
import type { ObjectLike } from '@unshared/types'
import type {
  RouteByName,
  RouteName,
  RouteOptions,
  RouteRequestBody,
  RouteRequestData,
  RouteRequestParameters,
  RouteRequestQuery,
  RouteResponseData,
  Routes,
} from './types'
import { createHttpRoute, ModuleBase } from '@unserved/server'

describe('createClient', () => {
  class ModuleUser extends ModuleBase {
    routes = {
      put: createHttpRoute({
        name: 'PUT /user/:id',
        parseBody: () => ({} as { name: string }),
        parseParameters: () => ({} as { id: string }),
        parseQuery: () => ({} as { q: string }),
      }, () => ({ id: '1', name: 'John Doe' })),
    }
  }

  describe('route', () => {
    it('should infer a union of all route names', () => {
      type Result = RouteName<ModuleUser>
      expectTypeOf<Result>().toEqualTypeOf<'PUT /user/:id'>()
    })

    it('should infer the route by name', () => {
      type Result = RouteByName<ModuleUser, 'PUT /user/:id'>
      type Expected = ModuleUser['routes']['put']
      expectTypeOf<Result>().toEqualTypeOf<Expected>()
    })

    it('should infer the request query', () => {
      type Result = RouteRequestQuery<ModuleUser, 'PUT /user/:id'>
      expectTypeOf<Result>().toEqualTypeOf<{ q: string }>()
    })

    it('should infer the request parameters', () => {
      type Result = RouteRequestParameters<ModuleUser, 'PUT /user/:id'>
      expectTypeOf<Result>().toEqualTypeOf<{ id: string }>()
    })

    it('should infer the request body', () => {
      type Result = RouteRequestBody<ModuleUser, 'PUT /user/:id'>
      expectTypeOf<Result>().toEqualTypeOf<{ name: string }>()
    })

    it('should infer the request data', () => {
      type Result = RouteRequestData<ModuleUser, 'PUT /user/:id'>
      expectTypeOf<Result>().toEqualTypeOf<{ id: string; name: string }>()
    })

    it('should infer the response data', () => {
      type Result = RouteResponseData<ModuleUser, 'PUT /user/:id'>
      expectTypeOf<Result>().toEqualTypeOf<{ id: string; name: string }>()
    })

    it('should infer the route options', () => {
      type Result = RouteOptions<ModuleUser, 'PUT /user/:id'>
      expectTypeOf<Result>().toEqualTypeOf<
        RequestOptions<
          FetchMethod,
          string,
          RouteRequestParameters<ModuleUser, 'PUT /user/:id'>,
          RouteRequestQuery<ModuleUser, 'PUT /user/:id'>,
          RouteRequestBody<ModuleUser, 'PUT /user/:id'>,
          ObjectLike,
          RouteResponseData<ModuleUser, 'PUT /user/:id'>
        >
      >()
    })

    it('should infer the routes', () => {
      type Result = Routes<ModuleUser>
      expectTypeOf<Result>().toEqualTypeOf<{
        'PUT /user/:id': RouteOptions<ModuleUser, 'PUT /user/:id'>
      }>()
    })
  })
})
