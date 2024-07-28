import { H3Event, RouterMethod } from 'h3'
import { Peer, WSError } from 'crossws'
import { IsNever, MaybePromise, UnionMerge } from '@unshared/types'

/** Symbol to identify a route object. */
export const SYMBOL_ROUTE = Symbol('route')

/** The name of the route. It includes the method and the path. */
export type RouteName = `${Uppercase<RouterMethod>} /${string}` & {}

/** A parser for the body, query, and parameters of the route. */
export type RouteParser<T = any, V = any> = (value: V) => T

/**
 * The options used to define a route. This includes the name of the route, the body, query,
 * parameters, and the callback that is called when the route is matched.
 */
export interface RouteOptions<
  RequestName extends RouteName = RouteName,
  RequestQuery extends RouteParser = RouteParser,
  RequestBody extends RouteParser = RouteParser,
  RequestParameter extends RouteParser = RouteParser,
  RequestFormData extends RouteParser<any, FormData> = RouteParser<any, FormData>,
> {
  name: RequestName
  body?: RequestBody
  query?: RequestQuery
  parameters?: RequestParameter
  formData?: RequestFormData
}

/**
 * The application handler context is the object that is passed to the handler function when
 * the route is matched. This object contains the event, context, body, query, and params.
 *
 * @template T The application handler options.
 */
export type RouteContext<T extends RouteOptions = never> =
  IsNever<T> extends true
    ? {
      event: H3Event
      body: any
      query: any
      parameters: any
      formData: any
    }
    : UnionMerge<{
      event: H3Event
      body: T['body'] extends RouteParser<infer Body, Record<string, unknown>> ? Body : never
      query: T['query'] extends RouteParser<infer Query> ? Query : never
      parameters: T['parameters'] extends RouteParser<infer Parameters> ? Parameters : never
      formData: T['formData'] extends RouteParser<infer FormData, FormData> ? FormData : never
    }>

/**
 * The application handler callback is a function that is called when the route is matched.
 *
 * @template T The application handler options.
 */
export type RouteHandler<T extends RouteOptions = never> = (context: RouteContext<T>) => unknown

////////////////////////////////////////

/** The name of the route. It includes the method and the path. */
export type WSRouteName = `WS /${string}` & {}

/**
 * The options used to define a WebSocket route. This includes the name of the route and the
 * callback that is called when the route is matched as well as the open, message, close, and
 * error handlers.
 */
export interface WSRouteOptions<
  RouteName extends WSRouteName = WSRouteName,
  RouteMessageParser extends RouteParser = RouteParser,
> {
  name: RouteName
  parseMessage?: RouteMessageParser
}

/**
 * The WebSocket handler context is the object that is passed to the handler function when
 * the WebSocket route is matched. This object contains the peer, message, and params.
 *
 * @template T The WebSocket handler options.
 */
export interface WebSocketRouteContext<T extends WSRouteOptions = never> {
  peer: Peer
  error: WSError
  payload: T extends WSRouteOptions<any, RouteParser<infer D>> ? D : any
  details: { code?: number; reason?: string }
}

/**
 * The WebSocket handler callback is a function that is called when the WebSocket route is matched.
 * This function is called when the WebSocket is opened, a message is received, the WebSocket is closed,
 * or an error occurs.
 */
export interface WSRouteHandlers<T extends WSRouteOptions = WSRouteOptions> {
  onOpen?: (context: Pick<WebSocketRouteContext<T>, 'peer'>) => MaybePromise<void>
  onMessage?: (context: Pick<WebSocketRouteContext<T>, 'payload' | 'peer'>) => MaybePromise<void>
  onClose?: (context: Pick<WebSocketRouteContext<T>, 'details' | 'peer'>) => MaybePromise<void>
  onError?: (context: Pick<WebSocketRouteContext<T>, 'error' | 'peer'>) => MaybePromise<void>
}

////////////////////////////////////////

/**
 * The application handler is a simple object that contains the path, method, and handler
 * for a specific route. This is used to bind the route to the router in the application.
 * This type is a union of the handler options and the handler callback.
 *
 * @template T The application handler options or route.
 * @template H The application handler callback.
 */
export type Route<
  T extends RouteOptions | WSRouteOptions = RouteOptions | WSRouteOptions,
  H extends RouteHandler | WSRouteHandlers = RouteHandler | WSRouteHandlers,
> =
  T extends { name: `WS ${string}` }
    ? H extends WSRouteHandlers ? UnionMerge<H | T> : never
    : H extends RouteHandler ? UnionMerge<{ callback: H } | T> : never

/**
 * Create a route with the given options and callback. This is used to create a route
 * that can be used in the application.
 *
 * @param options The route options.
 * @param callback The route callback.
 * @returns The route.
 */
export function createRoute<T extends RouteOptions, H extends RouteHandler<T>>(options: Readonly<T>, callback: H): Route<T, H>
export function createRoute<T extends WSRouteOptions, H extends WSRouteHandlers<T>>(options: Readonly<T>, handlers: H): Route<T, H>
export function createRoute<T extends RouteName, H extends RouteHandler<{ name: T }>>(name: T, callback: H): Route<{ name: T }, H>
export function createRoute<T extends WSRouteName, H extends WSRouteHandlers<{ name: T }>>(name: T, handlers: H): Route<{ name: T }, H>
export function createRoute(nameOrOptions: Readonly<RouteOptions>, callbackOrHandlers: RouteHandler | WSRouteHandlers): Route {

  // --- If the name is a string, then create a route with the given name and callback.
  if (typeof nameOrOptions === 'string') {
    return typeof callbackOrHandlers === 'function'
      ? ({ name: nameOrOptions, callback: callbackOrHandlers }) as unknown as Route
      : ({ name: nameOrOptions, ...callbackOrHandlers }) as unknown as Route
  }

  // --- Otherwise, create a route with the given options and handlers.
  return typeof callbackOrHandlers === 'function'
    ? ({ ...nameOrOptions, callback: callbackOrHandlers }) as unknown as Route
    : ({ ...nameOrOptions, ...callbackOrHandlers }) as unknown as Route
}

/* v8 ignore start */
if (import.meta.vitest) {
  test('should create a route with the given name and callback', () => {
    const callback = () => 'Hello, World!'
    const result = createRoute({ name: 'GET /api/user/:id' }, callback)
    expect(result).toStrictEqual({ name: 'GET /api/user/:id', callback })
    expectTypeOf(result).toEqualTypeOf<{ name: 'GET /api/user/:id'; callback: () => string }>()
  })
}
