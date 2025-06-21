import type { EventHandler } from 'h3'
import type { HttpRoute, HttpRouteOptions } from '../createHttpRoute'
import { defineEventHandler, getValidatedQuery, getValidatedRouterParams, readFormData, readValidatedBody, setResponseStatus } from 'h3'

/**
 * Given a route, create an event handler that can be used to handle a specific
 * HTTP request. The event handler reads the body, query, and parameters of the
 * request, validates them, and then calls the handler with the context.
 *
 * @param route The route to create the event handler for.
 * @returns The event handler that can be used to handle the request.
 */
export function createHttpEventHandler<T extends HttpRoute<HttpRouteOptions, unknown>>(route: T): EventHandler {
  return defineEventHandler(async(event) => {

    // --- Initialize the context variables.
    let body: unknown
    let query: unknown
    let formData: unknown
    let parameters: unknown

    // --- If the route has parameters, validate and parse them. If the
    // --- parameters are invalid, skip to the next event handler.
    try {
      if (typeof route.parseBody === 'function') body = await readValidatedBody(event, route.parseBody)
      if (typeof route.parseQuery === 'function') query = await getValidatedQuery(event, route.parseQuery)
      if (typeof route.parseFormData === 'function') formData = route.parseFormData(await readFormData(event))
      if (typeof route.parseParameters === 'function') parameters = await getValidatedRouterParams(event, route.parseParameters)
    }
    catch {
      setResponseStatus(event, 400, 'Bad Request')
      return
    }

    // --- Call the handler with the context and return the data.
    const response = await route.handler({ event, body, parameters, query, formData })
    // eslint-disable-next-line unicorn/no-null
    if (response === undefined) return null
    return response
  })
}
