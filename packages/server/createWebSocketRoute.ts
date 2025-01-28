import type { MaybePromise } from '@unshared/types'
import type { Peer, WSError } from 'crossws'
import type { Parser } from './types'

/** Symbol to identify a route object. */
export const SYMBOL_WS_ROUTE = Symbol.for('WebSocketRoute')

/** The name of the route. It includes the method and the path. */
export type WebSocketRouteName = `WS /${string}`

/** The context passed to the route handler. */
interface Context<T extends WebSocketRouteOptions> {
  peer: Peer
  error: WSError
  details: { code?: number; reason?: string }
  query: T extends WebSocketRouteOptions<any, any, any, any, infer U> ? U : never
  message: T extends WebSocketRouteOptions<any, infer U, any, any, any> ? U : never
  parameters: T extends WebSocketRouteOptions<any, any, any, infer U, any> ? U : never
}

/** The WebSocket route options. */
export interface WebSocketRouteOptions<
  Name extends WebSocketRouteName = WebSocketRouteName,
  ClientMessage = unknown,
  ServerMessage = unknown,
  Parameters = unknown,
  Query = unknown,
> {
  name: Name
  parseQuery?: Parser<Query>
  parseParameters?: Parser<Parameters>
  parseClientMessage?: Parser<ClientMessage>
  parseServerMessage?: Parser<ServerMessage>
}

/** The WebSocket route handlers. */
export interface WebSocketRouteHandlers<T extends WebSocketRouteOptions> {
  onOpen?: (context: Pick<Context<T>, 'parameters' | 'peer' | 'query'>) => MaybePromise<void>
  onMessage?: (context: Pick<Context<T>, 'message' | 'parameters' | 'peer' | 'query'>) => MaybePromise<void>
  onClose?: (context: Pick<Context<T>, 'details' | 'parameters' | 'peer' | 'query'>) => MaybePromise<void>
  onError?: (context: Pick<Context<T>, 'error' | 'peer'>) => MaybePromise<void>
}

/** A WebSocket route object. */
export type WebSocketRoute<
  T extends WebSocketRouteOptions = WebSocketRouteOptions,
  U extends WebSocketRouteHandlers<T> = WebSocketRouteHandlers<T>,
> = T & U & { [SYMBOL_WS_ROUTE]: true }

/**
 * Create a route that can be used to handle a WebSocket request. The route includes the path,
 * message, and the callback that is called when the route is matched.
 *
 * @param options The options used to define the route.
 * @param handlers The callback that is called when the route is matched.
 * @returns The route that can be used to handle the request.
 */
export function createWebSocketRoute<
  T extends WebSocketRouteOptions,
  U extends WebSocketRouteHandlers<T>,
>(
  options: Readonly<T>,
  handlers: Readonly<U>,
): WebSocketRoute<T, U> {
  return { [SYMBOL_WS_ROUTE]: true, ...options, ...handlers } as WebSocketRoute<T, U>
}
