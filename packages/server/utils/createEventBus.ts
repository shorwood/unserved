/* eslint-disable @typescript-eslint/consistent-type-definitions */

import type { H3Event } from 'h3'
import type { EventStream } from './createEventStream'
import { Emitter } from '@unshared/functions/createEmitter'
import { createEventStream } from './createEventStream'

export type EventBusEventMap<T> = {
  'mount': [event: H3Event, stream: EventStream<T>]
  'unmount': [event: H3Event, stream: EventStream<T>]
  'message': [message: T]
  'error': [error: Error]
  'subscribe': [event: H3Event, stream: EventStream<T>]
  'unsubscribe': [event: H3Event, stream: EventStream<T>]
  'close': []
}

/**
 * The "EventBus" module is responsible for managing the event streams that are used to
 * communicate between different parts of the application. It allows for subscribing to events
 * and broadcasting messages to all subscribers.
 *
 * @template T The type of data that the event bus will send.
 * @example
 * // Create an event bus and subscribe to it.
 * const eventBus = new EventBus<MyTaskData>()
 * const eventStream = eventBus.subscribe(event)
 *
 * // Send a message to the event bus.
 * await eventBus.sendMessage({ taskId: '123', status: 'running' })
 * await eventBus.sendMessage({ taskId: '456', status: 'completed' })
 *
 * // Send an error to the event bus.
 * await eventBus.sendError(new Error('Something went wrong'))
 * await eventBus.sendError('Something went wrong')
 */
export class EventBus<T> extends Emitter<EventBusEventMap<T>> {
  peers = new Map<H3Event, EventStream<T>>()

  /**
   * Subscribe to the event bus and return an event stream that can be used to
   * receive messages from the event bus. The event stream will be closed when
   * the event stream is closed or when the event bus is destroyed.
   *
   * @param event The event that triggered the subscription.
   * @returns An event stream that can be used to receive messages from the event bus.
   * @example
   *
   * // Create an event bus and subscribe to it.
   * const eventBus = new EventBus<MyTaskData>()
   * const eventStream = eventBus.subscribe(event)
   *
   * // Send a message to the event bus.
   * await eventBus.broadcast({ taskId: '123', status: 'running' })
   */
  subscribe(event: H3Event): EventStream<T> {

    // --- Prevent duplicate subscriptions on the same event.
    const exists = this.peers.get(event)
    if (exists) return exists

    // --- Create a new event stream that we will send as a response to the peer.
    const eventStream = createEventStream<T>(event)
    this.dispatch('subscribe', event, eventStream)
    if (this.peers.size === 0) this.dispatch('mount', event, eventStream)
    this.peers.set(event, eventStream)

    // --- Handle the event stream closing. When the last peer unsubscribes,
    // --- we will dispatch the unmount event and remove the event stream from the peers.
    eventStream.h3EventStream.onClosed(() => {
      this.dispatch('unsubscribe', event, eventStream)
      if (this.peers.size === 0) this.dispatch('unmount', event, eventStream)
      this.peers.delete(event)
    })

    // --- Return the new event stream.
    return eventStream
  }

  /**
   * Manually unsubscribe from the event bus. This will remove the event stream
   * from the list of peers and close the event stream. This is useful if you want to
   * unsubscribe from the event bus without closing the event stream.
   *
   * @param event The event that triggered the unsubscription.
   * @example
   * // Create an event bus and subscribe to it.
   * const eventBus = new EventBus<MyTaskData>()
   * const eventStream = eventBus.subscribe(event)
   *
   * // Unsubscribe from the event bus.
   * eventBus.unsubscribe(event)
   */
  async unsubscribe(event: H3Event): Promise<void> {
    const stream = this.peers.get(event)
    if (!stream) return
    await stream.h3EventStream.close()
    this.peers.delete(event)
  }

  /**
   * Broadcast a message to all peers subscribed to the event bus.
   * This will send the message to all peers and return once all messages have been sent.
   *
   * @param message The message to send to all peers.
   * @example
   * // Create an event bus and send a message to all peers.
   * const eventBus = new EventBus<MyTaskData>()
   * await eventBus.sendMessage({ taskId: '123', status: 'running' })
   * await eventBus.sendMessage({ taskId: '456', status: 'completed' })
   */
  async sendMessage(message: T): Promise<void> {
    for (const [,stream] of this.peers) {
      this.dispatch('message', message)
      await stream.sendMessage(message)
    }
  }

  /**
   * Broadcast an error to all peers subscribed to the event bus.
   * This will send the error to all peers and return once all messages have been sent.
   *
   * @param error The error to send to all peers.
   * If the error is a string, it will be converted to an `Error` object.
   * @example
   * // Create an event bus and send an error to all peers.
   * const eventBus = new EventBus<MyTaskData>()
   * await eventBus.sendError(new Error('Something went wrong'))
   * await eventBus.sendError('Something went wrong')
   */
  public async sendError(error: Error | string): Promise<void> {
    if (typeof error === 'string') error = new Error(error)
    for (const [,stream] of this.peers) {
      this.dispatch('error', error)
      await stream.sendError(error)
    }
  }

  /**
   * Close the event bus. This will close all event streams and remove all peers.
   * This is useful for cleaning up resources that were initialized when the event bus was mounted.
   */
  public async close(): Promise<void> {
    this.dispatch('close')
    await Promise.all([...this.peers.values()].map(stream => stream.h3EventStream.close()))
  }
}

/** The options for creating an event bus. */
export interface EventBusOptions<T> {

  /**
   * Callback that will be called when the event bus is mounted. Meaning when the
   * first peer subscribes to the event bus. This is useful for initializing
   * resources only when the event bus is actually used.
   *
   * @param event The event that triggered the mount.
   */
  onMount?: (event: H3Event) => void

  /**
   * Callback that will be called when the event bus is unmounted. Meaning when
   * there are no more peers subscribed to the event bus. This is useful for
   * cleaning up resources that were initialized when the event bus was mounted.
   *
   * @param event The event that triggered the unmount.
   */
  onUnmount?: (event: H3Event) => void

  /**
   * Callback that will be called when a message is sent to the event bus.
   * This is useful for logging or debugging purposes.
   *
   * @param message The message that was sent to the event bus.
   */
  onMessage?: (message: T) => void

  /**
   * Callback that will be called when an error is sent to the event bus.
   * This is useful for logging or debugging purposes.
   *
   * @param error The error that was sent to the event bus.
   */
  onError?: (error: Error) => void

  /**
   * Callback that will be called when a peer subscribes to the event bus.
   * This is useful for logging or debugging purposes.
   *
   * @param event The event that triggered the subscription.
   * @param stream The event stream that was created for the peer.
   */
  onSubscribe?: (event: H3Event, stream: EventStream<T>) => void

  /**
   * Callback that will be called when a peer unsubscribes from the event bus.
   * This is useful for logging or debugging purposes.
   *
   * @param event The event that triggered the unsubscription.
   * @param stream The event stream that was closed for the peer.
   */
  onUnsubscribe?: (event: H3Event, stream: EventStream<T>) => void

  /**
   * Callback that will be called when the event bus is closed.
   * This is useful for logging or debugging purposes.
   */
  onClose?: () => void
}

/**
 * Create an event bus that can be used to send messages to multiple peers.
 *
 * @returns An event bus that can be used to send messages to multiple peers.
 * @param options The options for the event bus.
 * @example
 * // Create an event bus and subscribe to it.
 * const eventBus = createEventBus<MyTaskData>()
 * const eventStream = eventBus.subscribe(event)
 *
 * // Send a message to the event bus.
 * await eventBus.sendMessage({ taskId: '123', status: 'running' })
 */
export function createEventBus<T>(options: EventBusOptions<T> = {}): EventBus<T> {
  const eventBus = new EventBus<T>()
  if (options.onMount) eventBus.on('mount', options.onMount)
  if (options.onUnmount) eventBus.on('unmount', options.onUnmount)
  if (options.onMessage) eventBus.on('message', options.onMessage)
  if (options.onError) eventBus.on('error', options.onError)
  if (options.onSubscribe) eventBus.on('subscribe', options.onSubscribe)
  if (options.onUnsubscribe) eventBus.on('unsubscribe', options.onUnsubscribe)
  if (options.onClose) eventBus.on('close', options.onClose)
  return eventBus
}
