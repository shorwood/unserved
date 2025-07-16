import type { HttpRouteName, ModuleInstance, Parser, ServerError, ServerErrorData } from '@unserved/server'
import type { WebSocketRouteName } from '@unserved/server'
import type { EventStream } from '@unserved/server/utils'
import type { FetchMethod, RequestOptions, SseEvent } from '@unshared/client/utils'
import type { ConnectOptions } from '@unshared/client/websocket'
import type { Awaitable } from '@unshared/functions/awaitable'
import type { Loose, MaybeFunction, ObjectLike, UnionMerge } from '@unshared/types'

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
  >>

export type RouteResponseData<T, N extends RouteName<T>> =
  RouteByName<T> extends infer Route
    ? Route extends { name: N; handler: (...args: any[]) => infer U | Promise<infer U> }
      ? U extends EventStream<infer U> ? Awaitable<AsyncIterable<SseEvent<U>>>
        : U extends ServerError<infer N, infer T> ? ServerErrorData<N, T>
          : U
      : never
    : never

export type RouteRequestOptions<T, N extends RouteName<T>> =
  RequestOptions<
    FetchMethod,
    string,
    RouteRequestParameters<T, N>,
    RouteRequestQuery<T, N>,
    RouteRequestBody<T, N>,
    ObjectLike,
    RouteResponseData<T, N>
  >

export type Routes<T> = {
  [P in RouteName<T>]: RouteRequestOptions<T, P>
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

export type ChannelClientMessage<T, N extends ChannelName<T>> =
  ChannelByName<T, N> extends { parseClientMessage: Parser<infer U extends ObjectLike> } ? Loose<U> : ObjectLike

export type ChannelServerMessage<T, N extends ChannelName<T>> =
  ChannelByName<T, N> extends { parseServerMessage: Parser<infer U extends ObjectLike> } ? Loose<U> : ObjectLike

export type ChannelConnectOptions<T, N extends ChannelName<T>> =
  ConnectOptions<
    string,
    ChannelQuery<T, N>,
    ChannelParameters<T, N>,
    ChannelClientMessage<T, N>,
    ChannelServerMessage<T, N>
  >

export type Channels<T> = {
  [N in ChannelName<T>]: ChannelConnectOptions<T, N>
}
