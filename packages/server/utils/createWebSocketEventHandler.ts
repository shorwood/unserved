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
  const peerContext = new Map<Peer, { parameters: Record<string, string> }>()
  return defineWebSocketHandler({
    async open(peer: Peer) {
      try {

        // --- If the route has parameters, parse them.
        if (route.parseParameters) {
          const wsUrl = peer.websocket?.url
          if (!wsUrl) return
          const url = new URL(wsUrl)
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

          // --- Parse and store the parameters in the context.
          peerContext.set(peer, { parameters: route.parseParameters(peerParameters) as Record<string, string> })
        }

        // --- Call the handler with the context and return the data.
        if (!route.onOpen) return
        return route.onOpen({ peer, parameters: peerContext.get(peer)?.parameters })
      }
      catch (error) {
        if (route.onError) await route.onError({ peer, error: error as Error })
        throw error
      }
    },

    async message(peer: Peer, message: Message) {
      try {

        // --- Parse the message.
        let messageData: unknown
        if (route.parseMessage) {
          const messageJson = message.toString()
          const messageObject: unknown = JSON.parse(messageJson)
          messageData = route.parseMessage(messageObject)
        }

        // --- Call the handler with the context.
        if (!route.onMessage) return
        return route.onMessage({
          peer,
          message: messageData,
          parameters: peerContext.get(peer)?.parameters,
        })
      }
      catch (error) {
        if (route.onError) await route.onError({ peer, error: error as Error })
        throw error
      }
    },

    close(peer: Peer, details: { code?: number; reason?: string }) {
      if (!route.onClose) return
      const parameters = peerContext.get(peer)?.parameters
      peerContext.delete(peer)
      return route.onClose({ peer, details, parameters })
    },

    error(peer: Peer, error: Error) {
      if (!route.onError) throw error
      return route.onError({ peer, error })
    },
  })
}
