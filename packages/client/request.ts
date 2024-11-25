/* eslint-disable @typescript-eslint/consistent-type-imports */
import type { ServerErrorData } from '@unserved/server'
import { fetch } from '@unshared/client'
import { RequestOptions as _RequestOptions } from '@unshared/client/utils'
import { IsNever, Override } from '@unshared/types'
import { handleResponse } from './handleResponse'
import { RouteName, RouteRequestBody, RouteRequestData, RouteRequestFormData, RouteRequestParameters, RouteRequestQuery, RouteResponseData } from './types'

export type RequestErrorCallback<T, P extends RouteName<T>> =
  IsNever<T> extends true
    ? (error: Error) => any
    : (error: Error | Extract<RouteResponseData<T, P>, ServerErrorData>) => any

export type RequestDataCallback<T, P extends RouteName<T>> =
  RouteResponseData<T, P> extends AsyncIterable<infer U>
    ? (data: U) => any
    : (data: Exclude<RouteResponseData<T, P>, ServerErrorData>) => any

export type RequestOptions<T, P extends RouteName<T>> = Override<_RequestOptions, {

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
   * The callback that is called when an error occurs during the request.
   */
  onError?: RequestErrorCallback<T, P>

  /**
   * The callback that is called when data is received from the request. This callback
   * will be called for each chunk of data that is received from the request.
   */
  onData?: RequestDataCallback<T, P>

  /**
   * The callback that is called when the request is successful. This callback will be
   * called after the request is complete and all data has been received.
   */
  onSuccess?: () => any

  /**
   * The callback that is called when the request is complete. This callback will be called
   * after the request is complete and all data has been received.
   */
  onEnd?: () => any
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
  const response = await fetch(name, options)
  return await handleResponse(response, options) as RouteResponseData<T, P>
}
