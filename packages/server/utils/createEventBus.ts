import type { H3Event } from 'h3'
import type { EventStream } from './createEventStream'
import { createEventStream } from './createEventStream'

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
export class EventBus<T> {
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
    const eventStream = createEventStream<T>(event)
    this.peers.set(event, eventStream)
    eventStream.h3EventStream.onClosed(() => this.peers.delete(event))
    return eventStream
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
    for (const [,stream] of this.peers)
      await stream.sendMessage(message)
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
    for (const [,stream] of this.peers)
      await stream.sendError(error)
  }
}

/**
 * Create an event bus that can be used to send messages to multiple peers.
 *
 * @returns An event bus that can be used to send messages to multiple peers.
 * @example
 * // Create an event bus and subscribe to it.
 * const eventBus = createEventBus<MyTaskData>()
 * const eventStream = eventBus.subscribe(event)
 *
 * // Send a message to the event bus.
 * await eventBus.sendMessage({ taskId: '123', status: 'running' })
 */
export function createEventBus<T>(): EventBus<T> {
  return new EventBus<T>()
}
