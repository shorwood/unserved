import { EventHandler, defineEventHandler, defineWebSocketHandler, getValidatedQuery, getValidatedRouterParams, readFormData, readValidatedBody } from 'h3'
import { Route, RouteHandler, RouteOptions, WSRouteHandlers, WSRouteOptions } from './createRoute'

function createHttpEventHandler<T extends Route<RouteOptions, RouteHandler>>(route: T): EventHandler {
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
    return await route.callback({ event, body, parameters, query, formData }) ?? Buffer.alloc(0)
  })
}

function createWsEventHandler<T extends Route<WSRouteOptions, WSRouteHandlers>>(route: T): EventHandler {
  return defineWebSocketHandler({
    open(peer) {
      if (!route.onOpen) return
      return route.onOpen({ peer })
    },

    message(peer, message) {
      if (!route.onMessage) return

      let payload: unknown
      if (route.parseMessage) {
        const messageJson = message.toString()
        const messageObject: unknown = JSON.parse(messageJson)
        payload = route.parseMessage(messageObject)
      }

      return route.onMessage({ peer, payload })
    },

    close(peer, details) {
      if (!route.onClose) return
      return route.onClose({ peer, details })
    },

    error(peer, error) {
      if (!route.onError) return
      return route.onError({ peer, error })
    },
  })
}

function isHttpRoute(route: Route): route is Route<RouteOptions, RouteHandler> {
  return 'callback' in route
}

export function createEventHandler<T extends Route>(route: T): EventHandler {
  return isHttpRoute(route) ? createHttpEventHandler(route) : createWsEventHandler(route)
}
