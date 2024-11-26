/* eslint-disable @typescript-eslint/no-unused-vars */
import type { HttpRoute, WebSocketRoute } from '@unserved/server'
import type { RouteByName, RouteMessage, RouteName, RouteRequestBody, RouteRequestData, RouteRequestFormData, RouteRequestParameters, RouteRequestQuery, RouteResponseData } from './types'
import { createError, createHttpRoute, createWebSocketRoute, ModuleBase } from '@unserved/server'

describe('types', () => {
  class ModuleTest extends ModuleBase {
    routes = {
      deleteArticle: createHttpRoute({ name: 'DELETE /article/:id' }, () => 'Hello'),
      getArticle: createHttpRoute({ name: 'GET /article/:id', parseParameters: () => ({ id: '123' }) }, () => 'Hello'),
      searchArticles: createHttpRoute({ name: 'GET /articles', parseQuery: () => ({ search: 'Hello' }) }, () => ['Hello']),
      createArticle: createHttpRoute({ name: 'POST /articles', parseBody: () => ({ name: 'Hello' }) }, () => 'Hello'),
      updateArticle: createHttpRoute({ name: 'PUT /article/:id', parseBody: () => ({ name: 'Hello' }) }, () => {}),
      subscribeArticle: createWebSocketRoute({ name: 'WS /article/:id' }, { onMessage: () => {} }),
      updateArticleImage: () => createHttpRoute({ name: 'PUT /article/:id/image', parseFormData: () => ({ image: 'Hello' }) }, () => {}),
    }
  }

  describe('InferRoute', () => {
    it('should infer the routes union of a module', () => {
      type Result = RouteByName<typeof ModuleTest>
      expectTypeOf<Result>().toEqualTypeOf<
        | HttpRoute<{ name: 'DELETE /article/:id' }, string>
        | HttpRoute<{ name: 'GET /article/:id'; parseParameters: () => { id: string } }, string>
        | HttpRoute<{ name: 'GET /articles'; parseQuery: () => { search: string } }, string[]>
        | HttpRoute<{ name: 'POST /articles'; parseBody: () => { name: string } }, string>
        | HttpRoute<{ name: 'PUT /article/:id'; parseBody: () => { name: string } }, void>
        | HttpRoute<{ name: 'PUT /article/:id/image'; parseFormData: () => { image: string } }, void>
        | WebSocketRoute<{ name: 'WS /article/:id' }, { onMessage: () => void }>
      >()
    })

    it('should infer the route name of a module', () => {
      type Result = RouteName<typeof ModuleTest>
      expectTypeOf<Result>().toEqualTypeOf<
        | 'DELETE /article/:id'
        | 'GET /article/:id'
        | 'GET /articles'
        | 'POST /articles'
        | 'PUT /article/:id'
        | 'PUT /article/:id/image'
        | 'WS /article/:id'
      >()
    })
  })

  describe('InferRequest', () => {
    it('should infer the query input of a route', () => {
      type Result = RouteRequestQuery<typeof ModuleTest, 'GET /articles'>
      expectTypeOf<Result>().toEqualTypeOf<{ search: string }>()
    })

    it('should infer the parameters input of a route', () => {
      type Result = RouteRequestParameters<typeof ModuleTest, 'GET /article/:id'>
      expectTypeOf<Result>().toEqualTypeOf<{ id: string }>()
    })

    it('should infer the form data input of a route', () => {
      type Result = RouteRequestFormData<typeof ModuleTest, 'PUT /article/:id/image'>
      expectTypeOf<Result>().toEqualTypeOf<{ image: string }>()
    })

    it('should infer the body input of a route', () => {
      type Result = RouteRequestBody<typeof ModuleTest, 'POST /articles'>
      expectTypeOf<Result>().toEqualTypeOf<{ name: string }>()
    })

    it('should infer the data input of a route', () => {
      class ModuleTest extends ModuleBase {
        routes = {
          createArticle: createHttpRoute({
            name: 'GET /articles/:id',
            parseBody: () => ({ name: 'Hello' }),
            parseFormData: () => ({ image: 'Hello' }),
            parseParameters: () => ({ id: '123' }),
            parseQuery: () => ({ search: 'Hello' }),
          }, () => 'Hello'),
        }
      }
      type Result = RouteRequestData<typeof ModuleTest, 'GET /articles/:id'>
      expectTypeOf<Result>().toEqualTypeOf<{ name: string; image: string; id: string; search: string }>()
    })

    it('should loosen the data input of a route when it can be undefined', () => {
      class ModuleTest extends ModuleBase {
        routes = {
          createArticle: createHttpRoute({
            name: 'GET /articles/:id',
            parseQuery: () => ({ search: 'Hello' as string | undefined }),
            parseParameters: () => ({ id: '123' as string | undefined }),
            parseBody: () => ({ name: 'Hello' as string | undefined }),
            parseFormData: () => ({ image: 'Hello' as string | undefined }),
          }, () => 'Hello'),
        }
      }
      type Result = RouteRequestData<typeof ModuleTest, 'GET /articles/:id'>
      expectTypeOf<Result>().toEqualTypeOf<{ name?: string; image?: string; id?: string; search?: string }>()
    })
  })

  describe('infer output', () => {
    it('should infer the output of a route with synchronous callback', () => {
      class ModuleTest extends ModuleBase { routes = { test: createHttpRoute({ name: 'GET /test' }, () => 'Hello') } }
      type Result = RouteResponseData<typeof ModuleTest, 'GET /test'>
      expectTypeOf<Result>().toEqualTypeOf<string>()
    })

    it('should infer the output of a route with asynchronous callback', () => {
      // eslint-disable-next-line @typescript-eslint/require-await
      class ModuleTest extends ModuleBase { routes = { test: createHttpRoute({ name: 'GET /test' }, async() => 'Hello') } }
      type Result = RouteResponseData<typeof ModuleTest, 'GET /test'>
      expectTypeOf<Result>().toEqualTypeOf<string>()
    })

    it('should infer the output of a route with event stream', () => {
      class ModuleTest extends ModuleBase {
        routes = {
          test: createHttpRoute({
            name: 'GET /test',
          }, ({ event }) => this.withEventStream<{ value: string }>(event, () => Promise.resolve())),
        }
      }
      type Result = RouteResponseData<typeof ModuleTest, 'GET /test'>
      expectTypeOf<Result>().toEqualTypeOf<AsyncIterable<{ value: string }>>()
    })

    it('should infer the output of an async route with event stream', () => {
      class ModuleTest extends ModuleBase {
        routes = {
          test: createHttpRoute({
            name: 'GET /test',
          // eslint-disable-next-line @typescript-eslint/require-await
          }, async({ event }) => this.withEventStream<{ value: string }>(event, () => Promise.resolve())),
        }
      }
      type Result = RouteResponseData<typeof ModuleTest, 'GET /test'>
      expectTypeOf<Result>().toEqualTypeOf<AsyncIterable<{ value: string }>>()
    })

    it('should infer the output of a WebSocket route', () => {
      class ModuleTest extends ModuleBase { routes = { test: createWebSocketRoute({ name: 'WS /test' }, {}) } }
      type Result = RouteResponseData<typeof ModuleTest, 'WS /test'>
      expectTypeOf<Result>().toEqualTypeOf<never>()
    })

    it('should infer the output of a synchronous route with error', () => {
      class ModuleTest extends ModuleBase {
        routes = {
          test: createHttpRoute({ name: 'GET /test' }, () => createError({
            name: 'E_TEST',
            statusCode: 400,
            statusMessage: 'Bad Request',
            message: 'This is a test error',
            data: { foo: 'bar' },
          })),
        }
      }
      type Result = RouteResponseData<typeof ModuleTest, 'GET /test'>
      expectTypeOf<Result>().toEqualTypeOf<{ name: 'E_TEST'; message: string; foo: string }>()
    })

    it('should infer the output of an asynchronous route with error', () => {
      class ModuleTest extends ModuleBase {
        routes = {
          test: createHttpRoute({ name: 'GET /test' },
            // eslint-disable-next-line @typescript-eslint/require-await
            async() => createError({
              name: 'E_TEST',
              statusCode: 400,
              statusMessage: 'Bad Request',
              message: 'This is a test error',
              data: { foo: 'bar' },
            })),
        }
      }
      type Result = RouteResponseData<typeof ModuleTest, 'GET /test'>
      expectTypeOf<Result>().toEqualTypeOf<{ name: 'E_TEST'; message: string; foo: string }>()
    })
  })

  describe('infer payload', () => {
    it('should infer the payload of a WebSocket route', () => {
      class ModuleTest extends ModuleBase {
        routes = { post: createWebSocketRoute({
          name: 'WS /post/:id',
          parseMessage: () => ({ id: '123' }),
        }, {}) }
      }
      type Result = RouteMessage<typeof ModuleTest, 'WS /post/:id'>
      expectTypeOf<Result>().toEqualTypeOf<{ id: string }>()
    })
  })
})
