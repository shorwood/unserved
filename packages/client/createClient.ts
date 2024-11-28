import type { HttpRouteName, ModuleInstance, Parser, ServerError, ServerErrorData } from '@unserved/server'
import type { WebSocketRouteName } from '@unserved/server'
import type { EventStream } from '@unserved/server/utils'
import type { Client } from '@unshared/client'
import type { FetchMethod, RequestOptions } from '@unshared/client/utils'
import type { ConnectOptions } from '@unshared/client/websocket'
import type { Loose, MaybeFunction, ObjectLike, UnionMerge } from '@unshared/types'
import { createClient as createBaseClient } from '@unshared/client/createClient'

/**************************************************************/
/* HTTP Routes                                                */
/**************************************************************/

export type RouteName<T> =
  ModuleInstance<T> extends { routes: Record<string, MaybeFunction<infer R>> }
    ? R extends { name: infer N extends HttpRouteName } ? HttpRouteName extends N ? never : N : never
    : never

export type RouteByName<T, N extends RouteName<T> = RouteName<T>> =
  ModuleInstance<T> extends { routes: Record<string, MaybeFunction<infer R>> }
    ? R extends { name: N } ? R : never
    : never

export type RouteRequestQuery<T, N extends RouteName<T>> =
  RouteByName<T, N> extends { parseQuery: Parser<infer U extends ObjectLike> } ? Loose<U> : never

export type RouteRequestParameters<T, N extends RouteName<T>> =
  RouteByName<T, N> extends { parseParameters: Parser<infer U extends ObjectLike> } ? Loose<U> : never

export type RouteRequestBody<T, N extends RouteName<T>> =
  RouteByName<T, N> extends { parseBody: Parser<infer U> } ? (U extends ObjectLike ? Loose<U> : U)
    : RouteByName<T, N> extends { parseFormData: Parser<infer U extends ObjectLike> } ? U
      : never

export type RouteRequestData<T, N extends RouteName<T>> =
  Loose<UnionMerge<
    | RouteRequestBody<T, N>
    | RouteRequestParameters<T, N>
    | RouteRequestQuery<T, N>
  >>

export type RouteResponseData<T, N extends RouteName<T>> =
  RouteByName<T> extends infer Route
    ? Route extends { name: N; handler: (...args: any[]) => Promise<infer U> | infer U }
      ? U extends EventStream<infer V> ? AsyncIterable<V>
        : U extends ServerError<infer N, infer T> ? ServerErrorData<N, T>
          : U
      : never
    : never

export type Routes<T> = {
  [P in RouteName<T>]:
  RequestOptions<
    FetchMethod,
    string,
    RouteRequestParameters<T, P>,
    RouteRequestQuery<T, P>,
    RouteRequestBody<T, P>,
    ObjectLike,
    RouteResponseData<T, P>
  >
}

/**************************************************************/
/* Web Sockets Channels                                       */
/**************************************************************/

export type ChannelName<T> =
  ModuleInstance<T> extends { routes: Record<string, MaybeFunction<infer R>> }
    ? R extends { name: infer N extends WebSocketRouteName } ? WebSocketRouteName extends N ? never : N : never
    : never

export type ChannelByName<T, N extends ChannelName<T> = ChannelName<T>> =
  ModuleInstance<T> extends { routes: Record<string, MaybeFunction<infer R>> }
    ? R extends { name: N } ? R : never
    : never

export type ChannelParameters<T, N extends ChannelName<T>> =
  ChannelByName<T, N> extends { parseParameters: Parser<infer U extends ObjectLike> } ? Loose<U> : ObjectLike

export type ChannelQuery<T, N extends ChannelName<T>> =
  ChannelByName<T, N> extends { parseQuery: Parser<infer U extends ObjectLike> } ? Loose<U> : ObjectLike

export type ChannelClientData<T, N extends ChannelName<T>> =
  ChannelByName<T, N> extends { parseMessage: Parser<infer U extends ObjectLike> } ? Loose<U> : ObjectLike

export type Channels<T> = {
  [P in ChannelName<T>]:
  ConnectOptions<
    string,
    ChannelQuery<T, P>,
    ChannelParameters<T, P>,
    ChannelClientData<T, P>
  >
}

/**
 * Create a new type-safe client for the application. The client can be used to fetch data from
 * the API and connect to the server using WebSockets with the given path.
 *
 * @param options The options to pass to the client.
 * @returns The client object with the request method.
 * @example
 * // Create a type-safe client for the application.
 * const client = createClient<[ModuleUser]>()
 *
 * // Fetch the data from the API.
 * const data = await client.request('GET /api/user/:id', { id: '1' })
 *
 * // Use the data from the API.
 * console.log(data) // { id: '1', name: 'John Doe' }
 */
export function createClient<T>(options?: RequestOptions): Client<Routes<T>, Channels<T>> {
  return createBaseClient(options)
}
