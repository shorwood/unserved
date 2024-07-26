import { EventStreamPayload } from '@unserve/server'
import { RequestOptions } from './request'

/**
 * Handle a request response where the content type is a stream of JSON objects. This function
 * will parse the JSON objects and yield the data to the caller. If an error occurs, the `onError`
 * callback will be called and the function will return.
 *
 * @param response The response to handle.
 * @param options The options to pass to the request.
 * @yields The parsed JSON data from the stream.
 */
export async function * handleResponseStream(response: Response, options: RequestOptions) {
  const { onError, onSuccess, onData, onEnd } = options
  try {
    const body = response.body
    if (!body) throw new Error('Response body is missing')
    const reader = body.getReader()
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const parts = new TextDecoder().decode(value)
        .trim()
        .split('\0')
        .filter(Boolean)

      // --- For each part, parse the JSON and yield the data.
      for (const part of parts) {
        const payload = JSON.parse(part) as EventStreamPayload<unknown>
        if (payload.error) throw payload.error
        if (!payload.data) continue
        if (onData) onData(payload.data)
        yield payload.data
      }
    }
  }

  // --- If an error occurs, call the `onError` callback.
  catch (error) {
    if (onError) onError(error as Error)
    if (onEnd) onEnd()
    return
  }

  // --- If the `onSuccess` callback is provided, call it.
  if (onSuccess) onSuccess()
  if (onEnd) onEnd()
}
