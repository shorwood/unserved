/* eslint-disable n/no-unsupported-features/node-builtins */
import { ApplicationOrModule } from '@unserve/server'
import { InferPayload, InferRouteName } from './types'

export interface ConnectOptions {

  /** The base URL to connect to. */
  baseUrl: string
}

export interface WebSocketConnection<T extends ApplicationOrModule, P extends InferRouteName<T>> {

  /**
   * Send a payload to the server. The payload will be serialized to JSON before sending.
   *
   * @param data The data to send to the server.
   */
  send(data: InferPayload<T, P>): void

  /**
   * Listen for events from the server. The event will be deserialized from JSON before calling the callback.
   *
   * @param event The event to listen for.
   * @param callback The callback to call when the event is received.
   * @returns A function to remove the event listener.
   */
  on<T>(event: 'close' | 'error' | 'message' | 'open', callback: (data: T) => void): () => void

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
export function connect<T extends ApplicationOrModule, P extends InferRouteName<T>>(name: P, options: ConnectOptions): WebSocketConnection<T, P> {
  const { baseUrl } = options
  const [method, path] = name.split(' ')
  if (!path || !method) throw new Error('Invalid path')
  const url = new URL(path, baseUrl)
  let webSocket = new WebSocket(url, 'ws')

  // --- If the connection is closed unexpectedly, try to reconnect.
  webSocket.addEventListener('close', (event) => {
    if (event.code !== 1000) webSocket = new WebSocket(url, 'ws')
  })

  // --- Declare the `send` function to send data to the server.
  function send(data: InferPayload<T, P>) {
    const json = JSON.stringify(data)
    webSocket.send(json)
  }

  // --- Declare the `on` function to listen for events from
  function on<T>(event: 'close' | 'error' | 'message' | 'open', callback: (data: T) => void) {
    const listener =(event: CloseEvent | Event | MessageEvent<any>) => {
      // @ts-expect-error: `data` exists on the event.
      const data = JSON.parse(event.data as string) as T
      callback(data)
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
