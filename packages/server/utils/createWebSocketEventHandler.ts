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
  return defineWebSocketHandler({
    async open(peer: Peer) {
      try {
        const wsUrl = peer.websocket.url
        if (!wsUrl) throw new Error('WebSocket URL is not defined.')
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
          peer.context.parameters = await route.parseParameters(peerParameters)
        }

        // --- If the route has query parameters, parse them.
        if (route.parseQuery) {
          const queryParameters = Object.fromEntries(url.searchParams)
          peer.context.query = await route.parseQuery(queryParameters)
        }

        // --- Call the handler with the context and return the data.
        if (!route.onOpen) return
        return route.onOpen({
          peer,
          parameters: peer.context.parameters,
          query: peer.context.query,
        })
      }
      catch (error) {
        if (!route.onError) throw error
        await route.onError({
          peer,
          error: error as Error,
        })
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
          query: peer.context.query,
          parameters: peer.context.parameters,
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
        return route.onClose({
          peer,
          details,
          query: peer.context.query,
          parameters: peer.context.parameters,
        })
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
