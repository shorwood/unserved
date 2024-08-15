import type { RequestOptions } from './request'
import { awaitable } from '@unshared/functions'
import { handleResponseStream } from './handleResponseStream'

/**
 * Handle a request response. This function will parse the response based on the content type and
 * return the data. If an error occurs, the `onError` callback will be called and the function will
 * throw an error.
 *
 * @param response The response to handle.
 * @param options The options to pass to the request.
 * @returns The parsed data from the response.
 */
export async function handleResponse(response: Response, options: RequestOptions): Promise<unknown> {
  const { onError, onSuccess, onData, onEnd } = options
  const type = response.headers.get('Content-Type')

  // --- If the response is not OK, throw an error with the response message.
  if (!response.ok) {
    const errorObject = await response.json().catch(() => ({ message: response.statusText })) as { message?: string }
    const error = new Error(errorObject.message ?? 'An error occurred')
    Object.assign(error, errorObject)
    if (onError) onError(error)
    if (onEnd) onEnd()
    throw error
  }

  // --- If the response is a application/stream+json, return an iterator that parses the JSON.
  if (type === 'application/stream+json') {
    const responseIterator = handleResponseStream(response, options)
    return awaitable(responseIterator).then(onEnd)
  }

  // --- If the response is a text/plain, return the text as-is.
  if (type === 'text/plain') {
    return await response.text()
      .then((data) => {
        if (onData) onData(data)
        if (onSuccess) onSuccess()
        return data
      })
      .catch((error: Error) => {
        if (onError) onError(error)
        throw error
      })
      .finally(onEnd)
  }

  // --- If the response is a application/json, parse the JSON and return it.
  if (type === 'application/json') {
    return await response.json()
      .then((data) => {
        if (onData) onData(data)
        if (onSuccess) onSuccess()
        return data as unknown
      })
      .catch((error: Error) => {
        if (onError) onError(error)
        throw error
      })
      .finally(onEnd)
  }

  // --- Otherwise, fallback to returning the response body as-is.
  if (onSuccess) onSuccess()
  if (onEnd) onEnd()
  return response.body
}
