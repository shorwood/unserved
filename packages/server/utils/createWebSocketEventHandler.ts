import type { Message, Peer } from 'crossws'
import type { EventHandler } from 'h3'
import type { WebSocketRoute } from '../createWebSocketRoute'
import { defineWebSocketHandler } from 'h3'

/**
 * Given a route, create an event handler that can be used to handle a specific
 * WebSocket request. The event handler reads the message, and then calls the
 * handler with the context.
 *
 * @param route The route to create the event handler for.
 * @returns The event handler that can be used to handle the request.
 */
export function createWebSocketEventHandler<T extends WebSocketRoute>(route: T): EventHandler {
  const peerContext = new Map<Peer, { parameters: unknown; query: unknown }>()
  return defineWebSocketHandler({
    async open(peer: Peer) {
      try {
        let query: unknown
        let parameters: unknown
        const wsUrl = peer.websocket.url
        if (!wsUrl) return
        const url = new URL(wsUrl)

        // --- If the route has parameters, parse them.
        if (route.parseParameters) {
          const partsRoute = route.name.split(' ')[1].split('/').filter(Boolean)
          const partsPeer = url.pathname.split('/').filter(Boolean)

          // --- Build the request parameters from the route and peer.
          const peerParameters: Record<string, string> = {}
          for (const partRoute of partsRoute) {
            const value = partsPeer.shift()
            if (!partRoute.startsWith(':')) continue
            const key = partRoute.slice(1)
            if (!value) break
            peerParameters[key] = value
          }

          // --- Parse the parameters using the user-defined parser.
          parameters = await route.parseParameters(peerParameters)
        }

        // --- If the route has query parameters, parse them.
        if (route.parseQuery) {
          const queryParameters = Object.fromEntries(url.searchParams)
          query = await route.parseQuery(queryParameters)
        }

        // --- Call the handler with the context and return the data.
        peerContext.set(peer, { parameters, query })
        if (!route.onOpen) return
        return route.onOpen({ peer, parameters, query })
      }
      catch (error) {
        if (!route.onError) throw error
        await route.onError({ peer, error: error as Error })
      }
    },

    async message(peer: Peer, message: Message) {
      try {

        // --- Parse the message.
        let messageData: unknown
        if (route.parseClientMessage) {
          const messageJson = message.toString()
          const messageObject: unknown = JSON.parse(messageJson)
          messageData = await route.parseClientMessage(messageObject)
        }

        // --- Call the handler with the context.
        if (!route.onMessage) return
        return await route.onMessage({
          peer,
          message: messageData,
          query: peerContext.get(peer)?.query,
          parameters: peerContext.get(peer)?.parameters,
        })
      }
      catch (error) {
        if (!route.onError) throw error
        await route.onError({ peer, error: error as Error })
      }
    },

    async close(peer: Peer, details: { code?: number; reason?: string }) {
      try {
        if (!route.onClose) return
        const context = peerContext.get(peer)
        const query = context?.query
        const parameters = context?.parameters
        peerContext.delete(peer)
        return route.onClose({ peer, details, parameters, query })
      }
      catch (error) {
        if (!route.onError) throw error
        await route.onError({ peer, error: error as Error })
      }
    },

    async error(peer: Peer, error: Error) {
      if (!route.onError) throw error
      await route.onError({ peer, error })
    },
  })
}
