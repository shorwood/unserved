import type { Message, Peer } from 'crossws'
import type { EventHandler } from 'h3'
import type { Route, RouteHandler, RouteOptions, WSRouteHandlers, WSRouteOptions } from './createRoute'
import { defineEventHandler, defineWebSocketHandler, getValidatedQuery, getValidatedRouterParams, readFormData, readValidatedBody } from 'h3'

/** The context for a WebSocket peer. */
type PeerWithContext = Peer<{ parameters: Record<string, string> }>

/**
 * Given a route, create an event handler that can be used to handle a specific
 * HTTP request. The event handler reads the body, query, and parameters of the
 * request, validates them, and then calls the handler with the context.
 *
 * @param route The route to create the event handler for.
 * @returns The event handler that can be used to handle the request.
 */
function createEventHandlerHttp<T extends Route<RouteOptions, RouteHandler>>(route: T): EventHandler {
  return defineEventHandler(async(event) => {

    // --- Initialize the context variables.
    let body: unknown
    let query: unknown
    let formData: unknown
    let parameters: unknown

    // --- Validate and parse the body, query, and parameters.
    if (route.body) body = await readValidatedBody(event, route.body)
    if (route.query) query = await getValidatedQuery(event, route.query)
    if (route.formData) formData = route.formData(await readFormData(event))

    // --- If the route has parameters, validate and parse them. If the
    // --- parameters are invalid, skip to the next event handler.
    try {
      if (route.parameters)
        parameters = await getValidatedRouterParams(event, route.parameters)
    }
    catch {
      return
    }

    // --- Call the handler with the context and return the data.
    // eslint-disable-next-line unicorn/no-null
    return await route.callback({ event, body, parameters, query, formData }) ?? null
  })
}

/**
 * Given a route, create an event handler that can be used to handle a specific
 * WebSocket request. The event handler reads the message, and then calls the
 * handler with the context.
 *
 * @param route The route to create the event handler for.
 * @returns The event handler that can be used to handle the request.
 */
function createEventHandlerWs<T extends Route<WSRouteOptions, WSRouteHandlers>>(route: T): EventHandler {
  return defineWebSocketHandler({
    open(peer: PeerWithContext) {

      // --- If the route has parameters, parse them.
      if (route.parameters) {
        const url = new URL(peer.url, `ws://${peer.addr}`)
        const partsRoute = route.name.split(' ')[1].split('/').filter(Boolean)
        const partsPeer = url.pathname.split('/').filter(Boolean)

        // --- Build the request parameters from the route and peer.
        const peerParameters: Record<string, string> = {}
        for (const partRoute of partsRoute) {
          const value = partsPeer.shift()
          if (!partRoute.startsWith(':')) continue
          const key = partRoute.slice(1)
          if (!value) break
          peerParameters[key] = value
        }

        // --- Parse and store the parameters in the context.
        try { peer.ctx.parameters = route.parameters(peerParameters) as Record<string, string> }
        catch (error) {
          if (!route.onError) throw error
          return route.onError({ peer, error: error as Error })
        }
      }

      // --- Call the handler with the context and return the data.
      if (!route.onOpen) return
      return route.onOpen({ peer, parameters: peer.ctx.parameters })
    },

    message(peer: PeerWithContext, message: Message) {
      if (!route.onMessage) return

      let messageData: unknown
      if (route.message) {
        try {
          const messageJson = message.toString()
          const messageObject: unknown = JSON.parse(messageJson)
          messageData = route.message(messageObject)
        }
        catch (error) {
          if (!route.onError) throw error
          return route.onError({ peer, error: error as Error })
        }
      }

      const { parameters } = peer.ctx
      return route.onMessage({ peer, message: messageData, parameters })
    },

    close(peer: PeerWithContext, details: { code?: number; reason?: string }) {
      if (!route.onClose) return
      return route.onClose({ peer, details, parameters: peer.ctx.parameters })
    },

    error(peer: PeerWithContext, error: Error) {
      if (!route.onError) throw error
      return route.onError({ peer, error })
    },
  })
}

/**
 * Check if the given route is an HTTP route.
 *
 * @param route The route to check.
 * @returns `true` if the route is an HTTP route, `false` otherwise.
 */
function isHttpRoute(route: Route): route is Route<RouteOptions, RouteHandler> {
  return 'callback' in route
}

/**
 * Given a route, create an event handler that can be used to handle a specific
 * HTTP request. The event handler reads the body, query, and parameters of the
 * request, validates them, and then calls the handler with the context.
 *
 * @param route The route to create the event handler for.
 * @returns The event handler that can be used to handle the request.
 * @example createEventHandler({ method: 'GET', path: '/users', callback: () => [] })
 */
export function createEventHandler<T extends Route>(route: T): EventHandler {
  return isHttpRoute(route)
    ? createEventHandlerHttp(route)
    : createEventHandlerWs(route)
}
