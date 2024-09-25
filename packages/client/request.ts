/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/consistent-type-imports */
import type { ApplicationOrModule, ErrorData } from '@unserved/server'
import { IsNever } from '@unshared/types'
import { handleResponse } from './handleResponse'
import { resolveRequestInit } from './resolveRequestInit'
import { InferInput, InferOutput, InferRouteName } from './types'

/** Type-safe options to pass to the client request based on the route. */
export type RequestOptionsData<T extends ApplicationOrModule = never, P extends InferRouteName<T> = never> =
  IsNever<T> extends true
    ? Record<string, unknown>
    : InferInput<T, P>

type RequestErrorCallback<T extends ApplicationOrModule, P extends InferRouteName<T>> =
  (error: Extract<InferOutput<T, P>, ErrorData>) => void

type RequestDataCallback<T extends ApplicationOrModule, P extends InferRouteName<T>> =
  InferOutput<T, P> extends AsyncIterable<infer U>
    ? (data: U) => void
    : (data: Exclude<InferOutput<T, P>, ErrorData>) => void

interface RequestOptionsHooks<T extends ApplicationOrModule = never, P extends InferRouteName<T> = never> {
  onError?: RequestErrorCallback<T, P>
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

/* v8 ignore start */
if (import.meta.vitest) {
  const { ModuleBase, createRoute, createError } = await import('@unserved/server')

  describe('requestOptionsData', () => {
    it('should infer the request data type', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      class ModuleTest extends ModuleBase {
        routes = {
          getFoo: createRoute({
            name: 'GET /test',
            parameters: () => ({ foo: 'Hello' }),
            query: () => ({ bar: 'Hello' }),
            body: () => ({ baz: 'Hello' }),
          }, () => {}),
        }
      }
      type Result = RequestOptionsData<typeof ModuleTest, 'GET /test'>
      expectTypeOf<Result>().toEqualTypeOf<{ foo: string; bar: string; baz: string }>()
    })

    it('should infer the request data type without a module', () => {
      type Result = RequestOptionsData
      expectTypeOf<Result>().toEqualTypeOf<Record<string, unknown>>()
    })
  })

  describe('requestErrorCallback', () => {
    it('should infer the error callback', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      class ModuleTest extends ModuleBase {
        routes = {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call
          getFoo: createRoute('GET /test', () => createError({
            name: 'E_TEST',
            message: 'Test error message',
            statusCode: 400,
            statusMessage: 'Bad Request',
            data: { foo: 'bar' },
          })),
        }
      }
      type Result = RequestErrorCallback<typeof ModuleTest, 'GET /test'>
      expectTypeOf<Result>().toEqualTypeOf<(error: { name: 'E_TEST'; message: string; foo: string }) => void>()
    })

    it('should only include the error type in the error callback', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      class ModuleTest extends ModuleBase {
        routes = {
          getFoo: createRoute('GET /test', () => {
            if (Math.random() > 0.5) return 'Hello'
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            return createError({
              name: 'E_TEST',
              message: 'Test error message',
              statusCode: 400,
              statusMessage: 'Bad Request',
              data: { foo: 'bar' },
            })
          }),
        }
      }
      type Result = RequestErrorCallback<typeof ModuleTest, 'GET /test'>
      expectTypeOf<Result>().toEqualTypeOf<(error: { name: 'E_TEST'; message: string; foo: string }) => void>()
    })
  })

  describe('requestDataCallback', () => {
    it('should infer the data callback', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
      class ModuleTest extends ModuleBase {
        routes = {
          getFoo: createRoute('GET /test', () => 'Hello'),
        }
      }
    type Result = RequestDataCallback<typeof ModuleTest, 'GET /test'>
    expectTypeOf<Result>().toEqualTypeOf<(data: string) => void>()
    })

    it('should exclude the error type from the data callback', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
      class ModuleTest extends ModuleBase {
        routes = {
          getFoo: createRoute('GET /test', () => {
            if (Math.random() > 0.5) return 'Hello'
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            return createError({
              name: 'E_TEST',
              message: 'Test error message',
              statusCode: 400,
              statusMessage: 'Bad Request',
              data: { foo: 'bar' },
            })
          }),
        }
      }
    type Result = RequestDataCallback<typeof ModuleTest, 'GET /test'>
    expectTypeOf<Result>().toEqualTypeOf<(data: 'Hello') => void>()
    })
  })
}
