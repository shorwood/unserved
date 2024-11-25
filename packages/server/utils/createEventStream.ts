import type { H3Event, EventStream as H3EventStream } from 'h3'
import { createEventStream as createH3EventStream } from 'h3'
import { randomUUID } from 'node:crypto'

/** The data that a task can send to the client. */
export type EventStreamPayload<T = unknown> =
  { data: T; error: undefined } |
  { data: undefined; error: Error }

/** The function that will run the task. */
export type EventStreamFunction<T = unknown> = (task: EventStream<T>) => Promise<void>

/**
 * The "Task" module is responsible for managing the tasks that are executed on the server
 * but needs to communicate with the client. This allows the server to send updates on
 * long-running tasks to the client and allows the client to cancel a task if needed.
 *
 * @template T The type of data that the task will send.
 */
export class EventStream<T = unknown> {

  constructor(public event: H3Event) {
    this.stream = createH3EventStream(event)
  }

  /** The H3 `EventStream` instance that will be used to send updates to the client. */
  public stream: H3EventStream

  /** The unique ID of the task. */
  public id = randomUUID() as string

  /**
   * Send some data to the client and await for it to be sent. This will
   * prevent the client from receiving 2 messages at the same time and will
   * ensure that the messages are sent in the correct order.
   *
   * @param data The data to send to the client.
   * @example
   * // Create a task.
   * const task = new Task('123', 'My Task')
   */
  public async send(data: T): Promise<void> {
    const message = JSON.stringify({ id: this.id, data })
    await this.stream.push(message)
  }

  /**
   * Abort a task. This will send an error to the client and close the stream.
   * This will allow the client to know that the task was cancelled and will
   * allow the server to clean up any resources that the task was using.
   *
   * @param error The error message to send to the client.
   */
  public async sendError(error: Error | string): Promise<void> {
    if (typeof error === 'string') error = new Error(error)
    const message = JSON.stringify({
      id: this.id,
      error: {
        name: error.name,
        code: error.name,
        message: error.message,
        stack: process.env.NODE_ENV === 'production' ? undefined : error.stack,
      },
    })
    await this.stream.push(message)
  }

  /**
   * Run a function with whithin a task and in the context of a `Task`. This
   * will provide the function with the ability to send updates to the client
   * and end once the function has completed or if an error occurs.
   *
   * @param event The event that triggered the task.
   * @param callback The function that will run the task.
   * @returns The stream of the task.
   */
  public static create<T>(event: H3Event, callback: EventStreamFunction<T>): { eventStream: EventStream<T>; promise: Promise<void> } {
    const instance = new EventStream(event)

    // --- Run the function and send the result to the client if it is not `undefined`.
    // --- Then, close the stream to signal the end of the task. If an error occurs,
    // --- send the error to the client and close the stream.
    const promise = callback(instance)

      // --- Catch any errors that occur and send them to the client.
      .catch(async(error: Error) => {
        await instance.sendError(error)
        throw error
      })

      // --- Finally, close the stream to signal the end of the task.
      .finally(() => {
        void instance.stream.close()
      })

    // --- Return the task and the promise of the task.
    return { eventStream: instance, promise }
  }
}

/**
 * Run a function with whithin a task and in the context of a `Task`. This
 * will provide the function with the ability to send updates to the client
 * and end once the function has completed or if an error occurs.
 *
 * @param event The event that triggered the task.
 * @param fn The function that will run the task.
 * @returns The stream of the task.
 */
export function createEventStream<T>(event: H3Event, fn: EventStreamFunction<T>) {
  return EventStream.create<T>(event, fn)
}
