import type { ApplicationOrModule, EventStream, ModuleInstance, RouteParser } from '@unserved/server'
import type { Function, Loose, MaybePromise, UnionMerge } from '@unshared/types'

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
export type InferPayload<T extends ApplicationOrModule, N extends InferRouteName<T>> =
  InferRoute<T> extends infer Route ? Route extends { name: N }
    ? Route extends { parseMessage: RouteParser<infer U> } ? U : never
    : never
    : never

/** Infer the output data given a route name. */
export type InferOutput<T extends ApplicationOrModule, N extends InferRouteName<T>> =
  InferRoute<T> extends infer Route
    ? Route extends { name: N; callback: (...args: any[]) => MaybePromise<infer Output> }
      ? Output extends EventStream<infer U> ? AsyncIterable<U> : Output
      : never
    : never

/* v8 ignore start */
/* eslint-disable @typescript-eslint/no-unused-vars */
if (import.meta.vitest) {
  const { ModuleBase, createRoute } = await import('@unserved/server')
  type H3Event = import('h3').H3Event

  // --- Mock module for testing.
  class ModuleBlog extends ModuleBase {
    routes = {
      getPost: createRoute( {
        name: 'GET /post/:id',
        query: () => ({ name: 'John Doe' }) as { name: string | undefined },
        parameters: () => ({ id: '123' }),
      }, ({ query }) => `Hello, ${query.name}` ),

      getPosts: createRoute( {
        name: 'GET /posts',
        query: () => ({ name: 'John Doe' }),
      }, ({ query }) => `Hello, ${query.name}` ),

      createPost: createRoute( {
        name: 'POST /test',
        query: () => ({ id: 'John Doe' }),
        body: () => ({ name: 'John Doe' }),
        formData: () => ({ file: 'file' }),
      }, () => {}),

      syncPost: createRoute( {
        name: 'WS /post/:id',
        parseMessage: () => ({ id: '123' }),
      }, {}),
    }
  }

  test('should infer the route of a module', () => {
    type Result = InferRoute<typeof ModuleBlog>
    expectTypeOf<Result>().toEqualTypeOf<
      InstanceType<typeof ModuleBlog>['routes']['createPost'] |
      InstanceType<typeof ModuleBlog>['routes']['getPost'] |
      InstanceType<typeof ModuleBlog>['routes']['getPosts'] |
      InstanceType<typeof ModuleBlog>['routes']['syncPost']
    >()
  })

  test('should infer the route name of a module', () => {
    type Result = InferRouteName<typeof ModuleBlog>
    expectTypeOf<Result>().toEqualTypeOf<'GET /post/:id' | 'GET /posts' | 'POST /test' | 'WS /post/:id'>()
  })

  test('should infer the input of a GET route', () => {
    type Result = InferInput<typeof ModuleBlog, 'GET /post/:id'>
    expectTypeOf<Result>().toEqualTypeOf<{ id: string; name?: string | undefined }>()
  })

  test('should infer the input of a POST route', () => {
    type Result = InferInput<typeof ModuleBlog, 'POST /test'>
    expectTypeOf<Result>().toEqualTypeOf<{ id: string; name: string; file: string }>()
  })

  test('should infer the output of a route', () => {
    type Result = InferOutput<typeof ModuleBlog, 'GET /post/:id'>
    expectTypeOf<Result>().toEqualTypeOf<string>()
  })

  test('should infer the payload of a WebSocket route', () => {
    type Result = InferPayload<typeof ModuleBlog, 'WS /post/:id'>
    expectTypeOf<Result>().toEqualTypeOf<{ id: string }>()
  })
}
