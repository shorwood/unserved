/* eslint-disable sonarjs/cognitive-complexity */
import { RequestOptions } from './request'

/**
 * Resolves the request body and/or query parameters based on the method type. This function
 * will mutate the `init` object to include the request body and headers based on the data type.
 *
 * @param name The name of the route to fetch.
 * @param options The options to pass to the request.
 * @returns The URL and the `RequestInit` object.
 */
export function resolveRequestInit(name: string, options: RequestOptions) {
  const { data, baseUrl, ...requestInit } = options

  // --- Extract the path and method from the name.
  const [method, path] = name.split(' ')
  if (!path) throw new Error('Could not extract the path from the route name.')
  if (!method) throw new Error('Could not extract the method from the route name.')
  if (!baseUrl) throw new Error('The base URL is required to resolve the request URL.')

  // --- Fill the path with the data.
  const url = new URL(path, baseUrl)
  const init: RequestInit = { ...requestInit }

  // --- If the method has a parameter, fill the path with the data.
  const parameters = path.match(/:(\w+)/g)
  if (parameters && data) {
    for (const parameter of parameters) {
      const key = parameter.slice(1)
      if (!data[key]) continue
      url.pathname = url.pathname.replace(parameter, data[key] as string)
      delete data[key]
    }
  }

  // --- If no `data` is provided, return early.
  if (!data) return { url, init }

  // --- Check if the method expects a body.
  // --- Check if the data contains any `File` objects.
  const isBodyMethod = ['POST', 'PUT', 'PATCH'].includes(method)
  const isFormData = Object.values(data).some((value) => {
    if (value instanceof File) return true
    if (Array.isArray(value)) return value.some(item => item instanceof File)
    return value instanceof Blob
  })

  // --- If the method does not expect a body, fill the query parameters.
  if (!isBodyMethod) {
    const search = new URLSearchParams({})
    for (const key in data) {
      const value = data[key]
      if (!value) continue
      search.set(key, String(value))
    }
    url.search = search.toString()
  }

  // --- If data contains a `File` object, create a FormData object.
  else if (isFormData) {
    const formData = new FormData()
    for (const key in data) {
      const value = data[key]
      if (value === null) continue
      if (value === undefined) continue

      // --- If the value is a FileList object, append each file to the FormData object.
      if (Array.isArray(value)) {
        for (const item of value)
          formData.append(key, item as Blob | string)
      }

      // --- If the value is a File object, append it to the FormData object.
      else {
        formData.append(key, value as Blob | string)
      }
    }

    // Create a stream from the FormData object and remove the content type.
    init.body = formData
  }

  // --- If the data is a Blob, pass it directly to the body.
  else if (data instanceof File) {
    init.body = data.stream()
    init.headers = init.headers ?? {}
    init.headers = { 'Content-Type': 'application/octet-stream' }
  }

  // --- Otherwise, stringify the data and set the content type to JSON.
  else if (typeof data === 'object') {
    init.body = JSON.stringify(data)
    init.headers = init.headers ?? {}
    init.headers = { 'Content-Type': 'application/json' }
  }

  // --- Return the URL and the `RequestInit`.
  return { url, init }
}

/* v8 ignore start */
if (import.meta.vitest) {
  test('should parse the method and path from the route name', () => {
    const result = resolveRequestInit('GET /api/product', { baseUrl: 'https://api.example.com' })
    expect(result.url.href).toBe('https://api.example.com/api/product/1')
    expect(result.init.method).toBe('GET')
  })
}
