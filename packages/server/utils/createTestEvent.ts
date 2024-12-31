import { H3Event } from 'h3'
import { IncomingMessage, ServerResponse } from 'node:http'
import { Socket } from 'node:net'

interface Options {
  method?: string
  headers?: Record<string, string>
  remoteAddress?: string
}

/**
 * Create a mock H3 event for testing.
 *
 * @param options The options to create the event with.
 * @returns The created H3 event.
 */
export function createTestEvent(options: Options = {}) {
  const { headers = {}, method = 'GET', remoteAddress = '127.0.0.1' } = options

  // --- Override the read-only `remoteAddress` property of the socket.
  const socket = new Socket()
  const request = new IncomingMessage(socket)
  const response = new ServerResponse(request)
  request.method = method

  // --- To avoid casing issues, force all headers to lower case.
  for (const key in headers) {
    const lower = key.toLowerCase()
    request.headers[lower] = headers[key]
  }

  // --- Return the created event.
  const event = new H3Event(request, response)
  event.context.clientAddress = remoteAddress
  return event
}
