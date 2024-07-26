/* eslint-disable @typescript-eslint/consistent-type-imports */
import { IsNever, PartialStrict } from '@unshared/types'
import type { ApplicationOrModule } from '@unserve/server'
import { InferInput, InferOutput, InferRouteName } from './types'
import { resolveRequestInit } from './resolveRequestInit'
import { handleResponse } from './handleResponse'

/** Type-safe options to pass to the client request based on the route. */
type RequestOptionsData<T extends ApplicationOrModule = never, P extends InferRouteName<T> = never> =
  IsNever<T> extends true
    ? Record<string, unknown>
    : PartialStrict<InferInput<T, P>>

type RequestErrorCallback = (error: Error) => void
type RequestDataCallback<T extends ApplicationOrModule, P extends InferRouteName<T>> =
  InferOutput<T, P> extends AsyncIterable<infer U>
    ? (data: U) => void
    : (data: InferOutput<T, P>) => void

interface RequestOptionsHooks<T extends ApplicationOrModule = never, P extends InferRouteName<T> = never> {
  onError?: RequestErrorCallback
  onData?: RequestDataCallback<T, P>
  onSuccess?: () => void
  onEnd?: () => void
}

export interface RequestOptions<
  T extends ApplicationOrModule = never,
  P extends InferRouteName<T> = never,
> extends
  RequestInit,
  RequestOptionsHooks<T, P> {

  /**
   * The data to pass to the request. This data will be used to fill the path
   * parameters, query parameters, body, and form data of the request based on
   * the route method.
   */
  data?: RequestOptionsData<T, P>

  /**
   * The base URL of the request. This URL will be used to resolve the path of
   * the route.
   */
  baseUrl?: string
}

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
export async function request<T extends ApplicationOrModule, P extends InferRouteName<T> = InferRouteName<T>>(name: P, options?: RequestOptions<T, P>): Promise<InferOutput<T, P>>
export async function request(name: string, options: RequestOptions = {}): Promise<unknown> {
  const { url, init } = resolveRequestInit(name, options)
  const response = await fetch(url, init)
  return await handleResponse(response, options)
}
