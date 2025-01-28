import type { FetchMethod, RequestOptions } from '@unshared/client/utils'
import type { ConnectOptions } from '@unshared/client/websocket'
import type { ObjectLike } from '@unshared/types'
import type {
  ChannelByName,
  ChannelClientMessage,
  ChannelConnectOptions,
  ChannelName,
  ChannelParameters,
  ChannelQuery,
  Channels,
  ChannelServerMessage,
  RouteByName,
  RouteName,
  RouteRequestBody,
  RouteRequestData,
  RouteRequestOptions,
  RouteRequestParameters,
  RouteRequestQuery,
  RouteResponseData,
  Routes,
} from './types'
import { createHttpRoute, ModuleBase } from '@unserved/server'
import { createWebSocketRoute } from '@unserved/server'

describe('createClient', () => {
  class ModuleUser extends ModuleBase {
    routes = {
      put: createHttpRoute({
        name: 'PUT /user/:id',
        parseBody: () => ({} as { name: string }),
        parseParameters: () => ({} as { id: string }),
        parseQuery: () => ({} as { q: string }),
      }, () => ({ id: '1', name: 'John Doe' })),

      ws: createWebSocketRoute({
        name: 'WS /users',
        parseClientMessage: () => ({} as { name: string }),
        parseServerMessage: () => ({} as { id: string; name: string }),
        parseParameters: () => ({} as { id: string }),
      }, {}),
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
      type Result = RouteRequestOptions<ModuleUser, 'PUT /user/:id'>
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
        'PUT /user/:id': RouteRequestOptions<ModuleUser, 'PUT /user/:id'>
      }>()
    })
  })

  describe('channel', () => {
    it('should infer a union of all channel names', () => {
      type Result = ChannelName<ModuleUser>
      expectTypeOf<Result>().toEqualTypeOf<'WS /users'>()
    })

    it('should infer the channel by name', () => {
      type Result = ChannelByName<ModuleUser, 'WS /users'>
      type Expected = ModuleUser['routes']['ws']
      expectTypeOf<Result>().toEqualTypeOf<Expected>()
    })

    it('should infer the channel parameters', () => {
      type Result = ChannelParameters<ModuleUser, 'WS /users'>
      expectTypeOf<Result>().toEqualTypeOf<{ id: string }>()
    })

    it('should infer the channel query', () => {
      type Result = ChannelQuery<ModuleUser, 'WS /users'>
      // @ts-expect-error: not implemented yet
      expectTypeOf<Result>().toEqualTypeOf<{ q: string }>()
    })

    it('should infer the channel client message', () => {
      type Result = ChannelClientMessage<ModuleUser, 'WS /users'>
      expectTypeOf<Result>().toEqualTypeOf<{ name: string }>()
    })

    it('should infer the channel server message', () => {
      type Result = ChannelServerMessage<ModuleUser, 'WS /users'>
      expectTypeOf<Result>().toEqualTypeOf<{ id: string; name: string }>()
    })

    it('should infer the channel connect options', () => {
      type Result = ChannelConnectOptions<ModuleUser, 'WS /users'>
      expectTypeOf<Result>().toEqualTypeOf<
        ConnectOptions<
          string,
          ChannelQuery<ModuleUser, 'WS /users'>,
          ChannelParameters<ModuleUser, 'WS /users'>,
          ChannelClientMessage<ModuleUser, 'WS /users'>,
          ChannelServerMessage<ModuleUser, 'WS /users'>
        >
      >()
    })

    it('should infer the channels', () => {
      type Result = Channels<ModuleUser>
      expectTypeOf<Result>().toEqualTypeOf<{
        'WS /users': ChannelConnectOptions<ModuleUser, 'WS /users'>
      }>()
    })
  })
})
