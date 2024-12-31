import type { Constructor, MaybeFunction, MaybePromise } from '@unshared/types'
import type { H3Event } from 'h3'
import type { BaseEntity } from './BaseEntity'
import type { Application } from './createApplication'
import type { ModuleRepositories, Route } from './types'
import type { EventStreamFunction } from './utils'
import { setHeader } from 'h3'
import { createEventStream } from './utils'

/**
 * A module is an isolated context that contains the entities, repositories as well as
 * methods and handlers for the module. It is used to create a module that can be registered
 * with the application.
 */
export class ModuleBase {

  /**
   * If the module is initialized or not. This is used to check if this module
   * and all its dependencies are initialized.
   */
  public isInitialized?: boolean = false

  /**
   * Initialize this module. This is used to perform any initialization steps that are required
   * before the module can be used. This can include connecting to the database, setting up
   * HTTP clients, etc.
   */
  public async initialize(): Promise<void> { /* empty */ }

  /**
   * The parent application of the module. This is used to access the application context
   * and the other modules that are registered within the application.
   *
   * @example application.getModule(ModuleUser)
   */
  public application?: Application

  /**
   * Register the modules' constructors this module depends on. At runtime, the application
   * checks if the dependencies are registered withing the application and throws an error
   * if they are not.
   */
  public dependencies: Constructor[] = []

  /**
   * The entities of the module. These are the entities that are used in the service to perform
   * operations on the database. Each entity is associated with a table in the database.
   */
  public entities: Record<string, typeof BaseEntity> = {}

  /**
   * The routes associated with the module. These are the routes that are used to handle
   * HTTP requests for the module.
   */
  public routes: Record<string, MaybeFunction<Route>> = {}

  /**
   * The errors associated with the module. These are the errors that are used to handle
   * exceptions that are thrown by the module. Each error is associated with a status code,
   * a message, and a name.
   */
  public errors: Record<string, MaybeFunction<MaybePromise<Error>, any[]>> = {}

  /**
   * Get the application context of the module. This is used to access the application context
   * and the other modules that are registered within the application.
   *
   * @returns The application context.
   */
  getApplication() {
    if (!this.application) throw new Error('Application not found')
    return this.application
  }

  /**
   * Get a map of repositories for the entities in the module. This is used to get the
   * repositories for the entities in the module. It will throw an error if the repository
   * is not found.
   *
   * @returns A map of repositories for the entities in the module.
   */
  getRepositories(): ModuleRepositories<this> {
    return new Proxy({}, {
      get: (_, name: string) => {
        const application = this.getApplication()
        if (!application.dataSource) throw new Error('DataSource not found')
        if (!this.entities[name]) throw new Error(`Entity not found: ${name}`)
        return application.dataSource.getRepository(this.entities[name])
      },
    }) as ModuleRepositories<this>
  }

  /**
   * Get the given module from the application. This is used to get the module instance
   * from the application context. It will throw an error if the module is not found.
   *
   * @param module The constructor of the module to get.
   * @returns The module instance.
   */
  getModule<T extends Constructor>(module: T): InstanceType<T> {
    return this.getApplication().getModule(module)
  }

  /**
   * Run a function in a transaction. This ensures that if the function fails, the transaction
   * is rolled back and the database is left in a consistent state.
   *
   * @param fn The function to run in the transaction.
   * @returns The result of the function.
   */
  async withTransaction<T>(fn: () => Promise<T>): Promise<T> {
    const application = this.getApplication()
    if (!application.dataSource) throw new Error('DataSource not found')
    return application.dataSource.transaction(fn)
  }

  /**
   * Run a function with whithin a task and in the context of an `H3Event`. This
   * will allow the function to send updates to the client and to be cancelled
   * if needed. This will also set the headers of the event to allow the client
   * to identify the response as a task and handle it accordingly.
   *
   * @param event The event that triggered the task.
   * @param fn The function that will run the task.
   * @returns The task that was created.
   */
  withEventStream<T extends object>(event: H3Event, fn: EventStreamFunction<T>) {
    const { eventStream, promise } = createEventStream<T>(event, fn)

    // --- If an error occurs, send the error to the client and remove the task from the map.
    promise.catch((error: Error) => {
      this.logger.error(error)
      throw error
    })

    // --- Set the task specific headers on the event to allow the client to identify
    // --- the response is a task and handle it accordingly.
    setHeader(event, 'X-EventStream-ID', eventStream.id)
    setHeader(event, 'Content-Type', 'application/stream+json')

    // --- Add the task to the map of tasks.
    return eventStream
  }

  /**
   * Get the logger instance of the application. If the logger is not found, it will throw an error.
   *
   * @returns The logger instance.
   */
  get logger() {
    const application = this.getApplication()
    if (!application.logger) throw new Error('Logger not found')
    return application.logger
  }
}
