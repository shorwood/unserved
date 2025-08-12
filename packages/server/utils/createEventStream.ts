import type { H3Event, EventStream as H3EventStream } from 'h3'
import { createEventStream as createH3EventStream } from 'h3'

/** The function that will run the eventStream. */
export type EventStreamFunction<T = unknown> = (eventStream: EventStream<T>) => Promise<void>

/**
 * The "EventStream" module is responsible for managing the tasks that are executed on the server
 * but needs to communicate with the client. This allows the server to send updates on
 * long-running tasks to the client and allows the client to cancel a task if needed.
 *
 * @template T The type of data that the eventStream will send.
 */
export class EventStream<T = unknown> {

  constructor(public event: H3Event) {
    this.h3EventStream = createH3EventStream(event)
  }

  /** The H3 `EventStream` instance that will be used to send updates to the client. */
  public h3EventStream: H3EventStream

  /**
   * Send some data to the client and await for it to be sent. This will
   * prevent the client from receiving 2 messages at the same time and will
   * ensure that the messages are sent in the correct order.
   *
   * @param data The data to send to the client.
   * @example
   * // Create an eventStream.
   * type MyTaskData = { progress: number; message: string }
   * const eventStream = new EventStream<MyTaskData>(event)
   *
   * // Send some data to the client.
   * await eventStream.send({ progress: 50, message: 'Task is halfway done' })
   */
  public async sendMessage(data: T): Promise<void> {
    await this.h3EventStream.push({
      event: 'message',
      data: JSON.stringify(data),
    })
  }

  /**
   * This will send an error to the client and close the stream.
   * This will allow the client to know that the eventStream was cancelled and will
   * allow the server to clean up any resources that the eventStream was using.
   *
   * @param error The error message to send to the client.
   */
  public async sendError(error: Error | string): Promise<void> {
    if (typeof error === 'string') error = new Error(error)
    await this.h3EventStream.push({
      event: 'error',
      data: JSON.stringify({
        name: error.name,
        message: error.message,
        stack: process.env.NODE_ENV === 'production' ? undefined : error.stack,
      }),
    })
  }

  /**
   * Close the eventStream. This will signal to the client that the eventStream has ended
   * and that no more updates will be sent. This is useful for long-running tasks that
   * have completed or if an error has occurred.
   *
   * @example
   * // Close the eventStream.
   * const eventStream = new EventStream<MyTaskData>(event)
   * await eventStream.close()
   */
  public async close(): Promise<void> {
    await this.h3EventStream.close()
  }

  /**
   * Run a function within an eventStream and in the context of an `EventStream`. This
   * will provide the function with the ability to send updates to the client
   * and end once the function has completed or if an error occurs.
   *
   * @param event The event that triggered the eventStream.
   * @param callback The function that will run the eventStream.
   * @returns The stream of the eventStream.
   */
  public static wrap<T>(event: H3Event, callback: EventStreamFunction<T>): EventStream<T> {
    const eventStream = new EventStream<T>(event)

    // --- Run the function and send the result to the client if it is not `undefined`.
    // --- Then, close the stream to signal the end of the eventStream. If an error occurs,
    // --- send the error to the client and close the stream.
    void callback(eventStream)

      // --- Catch any errors that occur and send them to the client.
      .catch(async(error: Error) => {
        await eventStream.sendError(error)
        throw error
      })

      // --- Finally, close the stream to signal the end of the eventStream.
      .finally(() => {
        void eventStream.h3EventStream.close()
      })

    // --- Return the eventStream and the promise of the eventStream.
    // return { eventStream, promise }
    return eventStream
  }
}

/**
 * Run a function within an eventStream and in the context of an `EventStream`. This
 * will provide the function with the ability to send updates to the client
 * and end once the function has completed or if an error occurs.
 *
 * @param event The event that triggered the eventStream.
 * @param fn
 * If provided, the function that will run the eventStream. Once the function
 * completes, the stream will be closed. If not provided, the stream will be created
 * and can be used to send updates to the client.
 * @returns The stream of the eventStream.
 *
 * @example
 * // Create an eventStream and run a function within it.
 * // The stream will be closed once the function completes.
 * const eventStream = createEventStream<MyTaskData>(event, async (stream) => {
 *   await stream.send({ progress: 50, message: 'Task is halfway done' })
 *   await new Promise(resolve => setTimeout(resolve, 5000))
 * })
 *
 * // Create an eventStream without a function.
 * // Note that we have to close the stream manually.
 * const eventStream = createEventStream<MyTaskData>(event)
 * eventStream.send({ progress: 50, message: 'Task is halfway done' })
 * eventStream.close()
 */
export function createEventStream<T>(event: H3Event, fn?: EventStreamFunction<T>): EventStream<T> {
  return fn
    ? EventStream.wrap<T>(event, fn)
    : new EventStream<T>(event)
}
