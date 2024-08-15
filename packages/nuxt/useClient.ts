import type { Server } from '@unserved/server'
import type { ApplicationOrModule } from '@unserved/server'
import { createClient } from '@unserved/client'
import { createGlobalState } from '@vueuse/core'

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
export const useClient = createGlobalState(<T extends ApplicationOrModule = Server['application']>() => createClient<T>())
