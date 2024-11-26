import type { RequestOptions as BaseRequestOptions, RequestHooks } from '@unshared/client/utils'
import type { Override } from '@unshared/types'
import type { RouteName, RouteRequestBody, RouteRequestData, RouteRequestFormData, RouteRequestParameters, RouteRequestQuery, RouteResponseData } from './types'
import { fetch } from '@unshared/client'
import { handleResponse } from '@unshared/client/utils'

export type RequestDataCallback<T, P extends RouteName<T>> =
  RouteResponseData<T, P> extends AsyncIterable<infer U>
    ? (data: U) => any
    : (data: RouteResponseData<T, P>) => any

export type RequestOptions<T, P extends RouteName<T>> = Override<BaseRequestOptions & RequestHooks, {

  /**
   * The data to pass to the request. This data will be used to fill the path
   * parameters, query parameters, body, and form data of the request based on
   * the route method.
   */
  data?: RouteRequestData<T, P>

  /**
   * The query parameters to pass to the request. This data will be used to fill
   * the query parameters of the request based on the route method.
   */
  query?: RouteRequestQuery<T, P>

  /**
   * The body to pass to the request. This data will be used to fill the body of
   * the request based on the route method.
   */
  body?: RouteRequestBody<T, P>

  /**
   * The form data to pass to the request. This data will be used to fill the form
   * data of the request based on the route method.
   */
  formData?: RouteRequestFormData<T, P>

  /**
   * The path parameters to pass to the request. This data will be used to fill the
   * path parameters of the request based on the route method.
   */
  parameters?: RouteRequestParameters<T, P>

  /**
   * The callback that is called when data is received from the request. This callback
   * will be called for each chunk of data that is received from the request.
   */
  onData?: RequestDataCallback<T, P>
}>

/**
 * Fetch a route from the API and return the data. If the client was instantiated with an
 * application, the route name will be inferred from the application routes. Otherwise, you
 * can pass the route name as a string.
 *
 * @param name The name of the route to fetch.
 * @param options The options to pass to the request.
 * @returns The data from the API.
 * @example
 * // Declare the application type.
 * type App = Application<[ModuleProduct]>
 *
 * // Create a type-safe client for the application.
 * const request = createClient<App>()
 *
 * // Fetch the data from the API.
 * const data = request('GET /api/product/:id', { data: { id: '1' } })
 */
export async function request<T, P extends RouteName<T>>(name: P, options: RequestOptions<T, P>): Promise<RouteResponseData<T, P>> {
  const response = await fetch(name, options as BaseRequestOptions)
  // @ts-expect-error: Data type mismatch is expected.
  return await handleResponse(response, options) as RouteResponseData<T, P>
}
