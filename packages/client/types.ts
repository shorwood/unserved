import type { ModuleInstance, Parser, ServerError, ServerErrorData } from '@unserved/server'
import type { EventStream } from '@unserved/server/utils'
import type { MaybeFunction, UnionMerge } from '@unshared/types'

/** Infer the path of the application. */
export type RouteName<T> =
  ModuleInstance<T> extends { routes: Record<string, infer R> }
    ? R extends MaybeFunction<{ name: infer U extends string }> ? U : never
    : string

/** Infer the routes of the application or module. */
export type RouteByName<T, N extends RouteName<T> = RouteName<T>> =
  ModuleInstance<T> extends { routes: Record<string, infer R> }
    ? R extends { name: N } ? R : never
    : never

export type RouteRequestQuery<T, N extends RouteName<T>> =
  RouteByName<T, N> extends { parseQuery: Parser<infer U> } ? U : never

export type RouteRequestParameters<T, N extends RouteName<T>> =
  RouteByName<T, N> extends { parseParameters: Parser<infer U> } ? U : never

export type RouteRequestBody<T, N extends RouteName<T>> =
  RouteByName<T, N> extends { parseBody: Parser<infer U> } ? U : never

export type RouteRequestFormData<T, N extends RouteName<T>> =
  RouteByName<T, N> extends { parseFormData: Parser<infer U> } ? U : never

export type RouteRequestData<T, N extends RouteName<T>> =
  UnionMerge<
    | RouteRequestBody<T, N>
    | RouteRequestFormData<T, N>
    | RouteRequestParameters<T, N>
    | RouteRequestQuery<T, N>
  >

/** Infer the payload data given a WebSocket route name. */
export type RouteMessage<T, N extends RouteName<T>> =
  RouteByName<T> extends infer Route ? Route extends { name: N }
    ? Route extends { parseMessage: Parser<infer U> } ? U : never
    : never
    : never

/** Infer the output data given a route name. */
export type RouteResponseData<T, N extends RouteName<T>> =
  RouteByName<T> extends infer Route
    ? Route extends { name: N; handler: (...args: any[]) => Promise<infer U> | infer U }
      ? U extends EventStream<infer V> ? AsyncIterable<V>
        : U extends ServerError<infer N, infer T> ? ServerErrorData<N, T>
          : U
      : never
    : never
