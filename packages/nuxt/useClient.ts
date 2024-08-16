import type { Client } from '@unserved/client'
import type { GlobalApplication } from '@unserved/nuxt/types'
import type { ApplicationOrModule } from '@unserved/server'
import type { useRequestURL } from 'nuxt/app'
import { createClient } from '@unserved/client'
import { createGlobalState } from '@vueuse/core'

declare namespace globalThis {
  const useRequestURL: typeof import('nuxt/app').useRequestURL
}

/**
 * Use the global client instance. This function will return the global client instance that is created
 * when the application is initialized. This function is useful for requesting routes with type inference
 * and caching. The client instance is created with the `createClient` function from the `@unserved/client`
 * package.
 *
 * @example
 *
 * // Request the 'GET /api/users' route.
 * const users = useClient().request('GET /api/users')
 *
 * // Request the 'GET /api/users/:id' route with the given ID.
 * const user = useClient().request('GET /api/users/:id', { data: { id: '123' } })
 *
 * // Connect to a websocket route.
 * const socket = useClient().connect('WS /api/chat')
 */
export const useClient = createGlobalState(() => {
  if ('useRequestURL' in globalThis === false) {
    console.warn('The `useRequestURL` function is not available. Make sure you are using Nuxt.')
    return
  }

  // --- Create a new client.
  const baseUrl = 'location' in globalThis
    // @ts-expect-error: The `useRequestURL` function is only available in Nuxt.
    ? useRequestURL().origin
    : window.location.origin

  return createClient({ baseUrl })
}) as <T extends ApplicationOrModule = GlobalApplication>() => Client<T>
