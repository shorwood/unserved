/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable sonarjs/cognitive-complexity */
import type { RequestOptions } from './request'

/**
 * Resolves the request body and/or query parameters based on the method type. This function
 * will mutate the `init` object to include the request body and headers based on the data type.
 *
 * @param name The name of the route to fetch.
 * @param options The options to pass to the request.
 * @returns The URL and the `RequestInit` object.
 */
export function resolveRequestInit(name: string, options: RequestOptions) {
  const { data: initialData, baseUrl, ...requestInit } = options

  // --- Extract the path and method from the name.
  const match = /^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS) (\/.+)$/.exec(name)
  if (!match) throw new Error('Could not resolve the path and method from the route name.')
  if (!baseUrl) throw new Error('Could not resolve the `RequestInit` object: the `baseUrl` is missing.')
  const [, method, path] = match

  // --- Fill the path with the data.
  const url = new URL(path, baseUrl)
  const init: RequestInit = { ...requestInit, method }
  const isObjectRaw = Object.prototype.toString.call(initialData) === '[object Object]'
  const data = isObjectRaw ? { ...initialData } : initialData

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
    expect(result.url.href).toBe('https://api.example.com/api/product')
    expect(result.init.method).toBe('GET')
  })

  test('should parse the method and replace the path parameters with the data', () => {
    const result = resolveRequestInit('GET /api/product/:id', { baseUrl: 'https://api.example.com', data: { id: 123 } })
    expect(result.url.href).toBe('https://api.example.com/api/product/123')
    expect(result.init.method).toBe('GET')
  })

  test('should append query parameters to the URL from the data', () => {
    const result = resolveRequestInit('GET /api/product', { baseUrl: 'https://api.example.com', data: { id: 123 } })
    expect(result.url.href).toBe('https://api.example.com/api/product?id=123')
    expect(result.init.method).toBe('GET')
  })

  test('should not append query parameters to the URL if a data property is null', () => {
    // eslint-disable-next-line unicorn/no-null
    const result = resolveRequestInit('GET /api/product', { baseUrl: 'https://api.example.com', data: { id: null } })
    expect(result.url.href).toBe('https://api.example.com/api/product')
    expect(result.init.method).toBe('GET')
  })

  test('should not append query parameters to the URL if a data property is undefined', () => {
    const result = resolveRequestInit('GET /api/product', { baseUrl: 'https://api.example.com', data: { id: undefined } })
    expect(result.url.href).toBe('https://api.example.com/api/product')
    expect(result.init.method).toBe('GET')
  })

  test.each(['POST', 'PUT', 'PATCH'])('should fill the body with the data and set the content type to JSON when method is %s', (method: string) => {
    const result = resolveRequestInit(`${method} /api/product`, { baseUrl: 'https://api.example.com', data: { id: 123 } })
    expect(result.url.href).toBe('https://api.example.com/api/product')
    expect(result.init.method).toBe(method)
    expect(result.init.body).toBe('{"id":123}')
    expect(result.init.headers).toStrictEqual({ 'Content-Type': 'application/json' })
  })

  test('should fill the body with a FormData object when the data contains a File object', () => {
    const file = new File(['Hello, World!'], 'hello.txt')
    const result = resolveRequestInit('POST /api/product', { baseUrl: 'https://api.example.com', data: { file } })
    expect(result.url.href).toBe('https://api.example.com/api/product')
    expect(result.init.method).toBe('POST')
    expect(result.init.body).toBeInstanceOf(FormData)
  })

  test('should pass the stream directly to the body when the data is a Blob', () => {
    const file = new File(['Hello, World!'], 'hello.txt')
    // @ts-expect-error: The `data` property accepts Blob objects.
    const result = resolveRequestInit('POST /api/product', { baseUrl: 'https://api.example.com', data: file })
    expect(result.url.href).toBe('https://api.example.com/api/product')
    expect(result.init.method).toBe('POST')
    // eslint-disable-next-line n/no-unsupported-features/node-builtins
    expect(result.init.body).toBeInstanceOf(ReadableStream)
    expect(result.init.headers).toStrictEqual({ 'Content-Type': 'application/octet-stream' })
  })

  test('should merge the options with the `RequestInit` object', () => {
    const result = resolveRequestInit('GET /api/product', { baseUrl: 'https://api.example.com', headers: { 'X-Test': 'Hello, World!' } })
    expect(result.url.href).toBe('https://api.example.com/api/product')
    expect(result.init.method).toBe('GET')
    expect(result.init.headers).toStrictEqual({ 'X-Test': 'Hello, World!' })
  })

  test('should throw when the path cannot be extracted from the route name', () => {
    const shouldThrow = () => resolveRequestInit('GET', { baseUrl: 'https://api.example.com' })
    expect(shouldThrow).toThrow('Could not resolve the path and method from the route name.')
  })

  test('should throw when the method cannot be extracted from the route name', () => {
    const shouldThrow = () => resolveRequestInit('/api/product', { baseUrl: 'https://api.example.com' })
    expect(shouldThrow).toThrow('Could not resolve the path and method from the route name.')
  })

  test('should throw when the baseUrl is missing', () => {
    const shouldThrow = () => resolveRequestInit('GET /api/product', {})
    expect(shouldThrow).toThrow('Could not resolve the `RequestInit` object: the `baseUrl` is missing.')
  })
}
