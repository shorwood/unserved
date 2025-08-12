import { createEvent } from 'h3'
import { IncomingMessage, ServerResponse } from 'node:http'
import { Socket } from 'node:net'

interface Options {
  url?: string
  method?: string
  parameters?: Record<string, string>
  body?: ReadableStream<Uint8Array> | Record<string, unknown> | string
  formData?: Record<string, string> | URLSearchParams
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
  const {
    url = '/',
    method = 'GET',
    parameters = {},
    body,
    formData,
    headers = {},
    remoteAddress = '127.0.0.1',
  } = options

  // --- Override the read-only `remoteAddress` property of the socket.
  const socket = new Socket()
  const request = new IncomingMessage(socket)
  const response = new ServerResponse(request)

  // @ts-expect-error: the `body` property is not defined on
  // `IncomingMessage`, but `h3` actually handles it.
  request.body = body
  request.url = url
  request.method = method

  // --- If `formData` is provided, create a stringified body.
  if (formData) {
    const boundary = '----WebKitFormBoundary'
    const parts: string[] = []
    for (const [key, value] of Object.entries(formData))
      parts.push(`--${boundary}\r\nContent-Disposition: form-data; name="${key}"\r\n\r\n${value}\r\n`)
    parts.push(`--${boundary}--\r\n`)
    // @ts-expect-error: ignore
    request.body = parts.join('')
    request.headers['content-type'] = `multipart/form-data; boundary=${boundary}`
  }

  // --- To avoid casing issues, force all headers to lower case.
  for (const key in headers) {
    const lower = key.toLowerCase()
    request.headers[lower] = headers[key]
  }

  // --- Return the created event.
  const event = createEvent(request, response)
  event.context.clientAddress = remoteAddress
  event.context.params = parameters
  event.node.req = request
  event.node.res = response
  return event
}
