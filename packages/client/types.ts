import type { ApplicationOrModule, Error, ErrorData, EventStream, ModuleInstance, RouteParser } from '@unserved/server'
import type { Function, Loose, UnionMerge } from '@unshared/types'

/**
 * Infer the routes of the application.
 *
 * @template T The application to infer the routes from.
 * @returns A union of the routes in the application.
 * @example type AppRoute = ApplicationRoute<App> // Route
 */
export type InferRoute<T extends ApplicationOrModule> =
  ModuleInstance<T> extends { routes: Record<string, infer Route> }
    ? Route extends Function<infer R> ? R : Route
    : never

/** Infer the path of the application. */
export type InferRouteName<T extends ApplicationOrModule> =
  InferRoute<T> extends { name: infer U extends string } ? U : never

/** Infer the input data given a route name. */
export type InferInput<T extends ApplicationOrModule, N extends InferRouteName<T>> =
  InferRoute<T> extends infer Route ? Route extends { name: N }
    ? UnionMerge<Loose<(
      (Route extends { body: RouteParser<infer B> } ? B : never) |
      (Route extends { formData: RouteParser<infer F> } ? F : never) |
      (Route extends { parameters: RouteParser<infer P> } ? P : never) |
      (Route extends { query: RouteParser<infer Q> } ? Q : never)
    )>>
    : never
    : never

/** Infer the payload data given a WebSocket route name. */
export type InferMessage<T extends ApplicationOrModule, N extends InferRouteName<T>> =
  InferRoute<T> extends infer Route ? Route extends { name: N }
    ? Route extends { message: RouteParser<infer U> } ? U : never
    : never
    : never

/** Infer the output data given a route name. */
export type InferOutput<T extends ApplicationOrModule, N extends InferRouteName<T>> =
  InferRoute<T> extends infer Route
    ? Route extends { name: N; callback: (...args: any[]) => Promise<infer U> | infer U }
      ? U extends EventStream<infer V> ? AsyncIterable<V>
        : U extends Error<infer N, infer T> ? ErrorData<N, T>
          : U
      : never
    : never

/* v8 ignore start */
/* eslint-disable @typescript-eslint/no-unused-vars */
if (import.meta.vitest) {
  const { ModuleBase, createRoute, createError } = await import('@unserved/server')

  describe('infer route', () => {
    it('should infer the route of a module', () => {
      class ModuleTest extends ModuleBase {
        routes = {
          getFoo: createRoute('GET /test', () => {}),
          postBar: createRoute({ name: 'POST /test' }, () => {}),
          wsFoo: createRoute('WS /test', {}),
        }
      }
      type Result = InferRoute<typeof ModuleTest>
      expectTypeOf<Result>().toEqualTypeOf<
        { name: 'GET /test'; callback: () => void }
        | { name: 'POST /test'; callback: () => void }
        | { name: 'WS /test' }
      >()
    })

    it('should infer the route name of a module', () => {
      class ModuleTest extends ModuleBase {
        routes = {
          getPost: createRoute('GET /post/:id', () => {}),
          getPosts: createRoute('GET /posts', () => {}),
          postTest: createRoute('POST /test', () => {}),
          wsPost: createRoute('WS /post/:id', {}),
        }
      }
      type Result = InferRouteName<typeof ModuleTest>
      expectTypeOf<Result>().toEqualTypeOf<'GET /post/:id' | 'GET /posts' | 'POST /test' | 'WS /post/:id'>()
    })
  })

  describe('infer input', () => {
    it('should infer the query input of a GET route', () => {
      class ModuleTest extends ModuleBase {
        routes = { test: createRoute({
          name: 'GET /test',
          query: () => ({ id: '123' }),
        }, () => 'Hello') }
      }
      type Result = InferInput<typeof ModuleTest, 'GET /test'>
      expectTypeOf<Result>().toEqualTypeOf<{ id: string }>()
    })

    it('should infer the parameters input of a GET route', () => {
      class ModuleTest extends ModuleBase {
        routes = { test: createRoute({
          name: 'GET /test/:id',
          parameters: () => ({ id: '123' }),
        }, () => 'Hello') }
      }
      type Result = InferInput<typeof ModuleTest, 'GET /test/:id'>
      expectTypeOf<Result>().toEqualTypeOf<{ id: string }>()
    })

    it('should infer the body input of a POST route', () => {
      class ModuleTest extends ModuleBase {
        routes = { test: createRoute({
          name: 'POST /test',
          body: () => ({ id: '123', name: 'John Doe' }),
        }, () => 'Hello') }
      }
      type Result = InferInput<typeof ModuleTest, 'POST /test'>
      expectTypeOf<Result>().toEqualTypeOf<{ id: string; name: string }>()
    })
  })

  describe('infer output', () => {
    it('should infer the output of a route with synchronous callback', () => {
      class ModuleTest extends ModuleBase { routes = { test: createRoute({ name: 'GET /test' }, () => 'Hello') } }
      type Result = InferOutput<typeof ModuleTest, 'GET /test'>
      expectTypeOf<Result>().toEqualTypeOf<string>()
    })

    it('should infer the output of a route with asynchronous callback', () => {
      // eslint-disable-next-line @typescript-eslint/require-await
      class ModuleTest extends ModuleBase { routes = { test: createRoute({ name: 'GET /test' }, async() => 'Hello') } }
      type Result = InferOutput<typeof ModuleTest, 'GET /test'>
      expectTypeOf<Result>().toEqualTypeOf<string>()
    })

    it('should infer the output of a route with event stream', () => {
      class ModuleTest extends ModuleBase {
        routes = {
          test: createRoute({
            name: 'GET /test',
          }, ({ event }) => this.withEventStream<{ value: string }>(event, () => Promise.resolve())),
        }
      }
      type Result = InferOutput<typeof ModuleTest, 'GET /test'>
      expectTypeOf<Result>().toEqualTypeOf<AsyncIterable<{ value: string }>>()
    })

    it('should infer the output of an async route with event stream', () => {
      class ModuleTest extends ModuleBase {
        routes = {
          test: createRoute({
            name: 'GET /test',
          // eslint-disable-next-line @typescript-eslint/require-await
          }, async({ event }) => this.withEventStream<{ value: string }>(event, () => Promise.resolve())),
        }
      }
      type Result = InferOutput<typeof ModuleTest, 'GET /test'>
      expectTypeOf<Result>().toEqualTypeOf<AsyncIterable<{ value: string }>>()
    })

    it('should infer the output of a WebSocket route', () => {
      class ModuleTest extends ModuleBase { routes = { test: createRoute({ name: 'WS /test' }, {}) } }
      type Result = InferOutput<typeof ModuleTest, 'WS /test'>
      expectTypeOf<Result>().toEqualTypeOf<never>()
    })

    it('should infer the output of a synchronous route with error', () => {
      class ModuleTest extends ModuleBase {
        routes = {

          test: createRoute('GET /test', () => createError({
            name: 'E_TEST',
            statusCode: 400,
            statusMessage: 'Bad Request',
            message: 'This is a test error',
            data: { foo: 'bar' },
          })),
        }
      }
      type Result = InferOutput<typeof ModuleTest, 'GET /test'>
      expectTypeOf<Result>().toEqualTypeOf<{ name: 'E_TEST'; message: string; foo: string }>()
    })

    it('should infer the output of an asynchronous route with error', () => {
      class ModuleTest extends ModuleBase {
        routes = {
          test: createRoute('GET /test',
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
      type Result = InferOutput<typeof ModuleTest, 'GET /test'>
      expectTypeOf<Result>().toEqualTypeOf<{ name: 'E_TEST'; message: string; foo: string }>()
    })
  })

  describe('infer payload', () => {
    it('should infer the payload of a WebSocket route', () => {
      class ModuleTest extends ModuleBase {
        routes = { post: createRoute({
          name: 'WS /post/:id',
          message: () => ({ id: '123' }),
        }, {}) }
      }
      type Result = InferMessage<typeof ModuleTest, 'WS /post/:id'>
      expectTypeOf<Result>().toEqualTypeOf<{ id: string }>()
    })
  })
}
