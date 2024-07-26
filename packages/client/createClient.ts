import { Result, attempt } from '@unshared/functions'
import { ApplicationOrModule } from '@unserve/server'
import { InferOutput, InferRouteName } from './types'
import { RequestOptions, request } from './request'
import { connect } from './connect'

export class Client<T extends ApplicationOrModule> extends EventTarget {

  /**
   * Create a new client for the application.
   *
   * @param options The options to pass to the client.
   * @example new Client({ baseUrl: 'https://api.example.com' })
   */
  constructor(options: Partial<Pick<Client<T>, 'baseUrl' | 'headers'>> = {}) {
    super()
    if (options.headers) this.headers = options.headers
    if (options.baseUrl) this.baseUrl = options.baseUrl
  }

  /**
   * The headers to use in the request. By default, the content type is set to `application/json`.
   * If you need to change the content type, you can do so by setting the `Content-Type` header.
   *
   * You can also set additional headers by adding them to the object and they will be sent with
   * every request. For example, you can set the `Authorization` header to send an access token.
   */
  public headers: Record<string, Record<string, string>> = {}

  /**
   * @returns The base URL to use in the request.
   */
  public baseUrl = 'http://localhost:3000'

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
  public async request<P extends InferRouteName<T>>(name: P, options: RequestOptions<T, P> = {}): Promise<InferOutput<T, P>> {
    return request(name, {
      ...options,
      baseUrl: this.baseUrl,
      headers: {
        ...this.headers['*'],
        ...this.headers[this.baseUrl],
        ...options.headers,
      },
    })
  }

  /**
   * Attempt to fetch a route from the API and return the data. If the client was instantiated with an
   * application, the route name will be inferred from the application routes. Otherwise, you
   * can pass the route name as a string.
   *
   * @param name The name of the route to fetch.
   * @param options The options to pass to the request.
   * @returns A result object with either the data or an error.
   * @example
   * // Declare the application type.
   * type App = Application<[ModuleProduct]>
   *
   * // Create a type-safe client for the application.
   * const request = createClient<App>()
   *
   * // Fetch the data from the API.
   * const { data, error } = requestAttempt('GET /api/product/:id', { data: { id: '1' } })
   * if (error) console.error(error)
   * else console.log(data)
   */
  public async requestAttempt<P extends InferRouteName<T>>(name: P, options?: RequestOptions<T, P>): Promise<Result<InferOutput<T, P>>> {
    return await attempt(async() => await this.request(name, options))
  }

  /**
   * Create a new WebSocket connection to the server with the given path. The connection will
   * automatically reconnect if the connection is closed unexpectedly.
   *
   * @param name The path to connect to.
   * @returns The WebSocket connection.
   */
  public connect<P extends InferRouteName<T>>(name: P) {
    return connect(name, { baseUrl: this.baseUrl })
  }
}

/**
 * Create a new type-safe client for the application. The client can be used to fetch data from
 * the API and connect to the server using WebSockets with the given path.
 *
 * @param options The options to pass to the client.
 * @returns The client object with the request method.
 * @example
 * // Create a type-safe client for the application.
 * const client = createClient<[ModuleUser]>()
 *
 * // Fetch the data from the API.
 * const data = await client.request('GET /api/user/:id', { id: '1' })
 *
 * // Use the data from the API.
 * console.log(data) // { id: '1', name: 'John Doe' }
 */
export function createClient<T extends ApplicationOrModule>(options?: Partial<Client<T>>) {
  const client = new Client<T>(options)
  return {
    connect: client.connect.bind(client),
    request: client.request.bind(client),
    requestAttempt: client.requestAttempt.bind(client),
  }
}
