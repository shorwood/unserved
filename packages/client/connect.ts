/* eslint-disable n/no-unsupported-features/node-builtins */
import type { ApplicationOrModule } from '@unserved/server'
import type { InferInput, InferMessage, InferRouteName } from './types'

export interface ConnectOptions<T extends ApplicationOrModule, P extends InferRouteName<T>> {

  /** The base URL to connect to. */
  baseUrl: string

  /**
   * The data to send when creating the connection. Namely, the path parameters
   * to use when connecting to the server.
   *
   * @example
   * ```ts
   * // The connection will be made to `http://localhost:8080/users/1`.
   * connect('GET /users/:id', {
   *   data: { id: 1 },
   *   baseUrl: 'http://localhost:8080'
   * })
   * ```
   */
  data?: InferInput<T, P>
}

export interface WebSocketConnection<T extends ApplicationOrModule, P extends InferRouteName<T>> {

  /**
   * Send a payload to the server. The payload will be serialized to JSON before sending.
   *
   * @param message The data to send to the server.
   */
  send(message: InferMessage<T, P>): void

  /**
   * Listen for events from the server. The event will be deserialized from JSON before calling the callback.
   *
   * @param event The event to listen for.
   * @param callback The callback to call when the event is received.
   * @returns A function to remove the event listener.
   */
  on<T>(event: 'close' | 'error' | 'message' | 'open', callback: (payload: T) => void): () => void

  /**
   * Close the WebSocket connection to the server. The connection will not be able to send or receive
   * messages after it is closed.
   */
  close(): void
}

/**
 * Create a new WebSocket connection to the server with the given path. The connection will
 * automatically reconnect if the connection is closed unexpectedly.
 *
 * @param name The path to connect to.
 * @param options The options to pass to the connection.
 * @returns The WebSocket connection.
 */
export function connect<T extends ApplicationOrModule, P extends InferRouteName<T>>(name: P, options: ConnectOptions<T, P>): WebSocketConnection<T, P> {
  const { baseUrl, data } = options

  // --- Parse the method and path from the route name.
  const [method, path] = name.split(' ')
  const url = new URL(path, baseUrl)
  if (!path || !method) throw new Error('Invalid path')

  // --- If the method has a parameter, fill the path with the data.
  const parameters = path.match(/:([\w-]+)/g)
  if (parameters && data) {
    for (const parameter of parameters) {
      const key = parameter.slice(1)
      if (!data[key]) continue
      url.pathname = url.pathname.replace(parameter, data[key] as string)
      delete data[key]
    }
  }

  // --- Create a new WebSocket connection.
  let webSocket = new WebSocket(url, 'ws')

  // --- If the connection is closed unexpectedly, try to reconnect.
  webSocket.addEventListener('close', (event) => {
    if (event.code !== 1000) webSocket = new WebSocket(url, 'ws')
  })

  // --- Declare the `send` function to send data to the server.
  function send(data: InferMessage<T, P>) {
    const json = JSON.stringify(data)
    webSocket.send(json)
  }

  // --- Declare the `on` function to listen for events from
  function on<T>(event: 'close' | 'error' | 'message' | 'open', callback: (data: T) => void) {
    const listener = (event: CloseEvent | Event | MessageEvent<any>) => {
      // @ts-expect-error: `data` exists on the event.
      let data = event.data as unknown
      try { data = JSON.parse(data as string) }
      catch { /* Ignore the error. */ }
      callback(data as T)
    }

    webSocket.addEventListener(event, listener)
    return () => webSocket.removeEventListener(event, listener)
  }

  // --- Declare the `close` function to close the connection.
  function close() {
    webSocket.close(1000, 'Client closed the connection')
  }

  // --- Return the `send` and `on` functions.
  return { send, on, close }
}
