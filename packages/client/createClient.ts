import type { Client } from '@unshared/client'
import type { RequestOptions } from '@unshared/client/utils'
import type { Channels, Routes } from './types'
import { createClient as createBaseClient } from '@unshared/client/createClient'

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
export function createClient<T>(options?: RequestOptions): Client<Routes<T>, Channels<T>> {
  return createBaseClient(options)
}
