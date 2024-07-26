import { DataSource, DataSourceOptions } from 'typeorm'
import { createServer } from 'node:http'
import { EventHandler, RouterMethod, createApp, createRouter, toNodeListener } from 'h3'
import { Constructor } from '@unshared/types'
import { dedent } from '@unshared/string'
import { isConstructor } from '@unshared/functions'
import { Once } from '@unshared/decorators'
import { InferEntities, InferOptions, ModuleInstance, ModuleLike } from './types'
import { createEventHandler } from './createEventHandler'

export interface ApplicationOptionsBase {
  database?: DataSourceOptions['type']
  databaseHost?: string
  databasePort?: number
  databaseName?: string
  databaseUser?: string
  databasePassword?: string
  databaseSsl?: boolean
  synchronize?: boolean
  dataSource?: DataSource
  dataSourceOptions?: DataSourceOptions
}

export type ApplicationOptions<T extends ModuleLike> =
  ApplicationOptionsBase & InferOptions<T>

export const DEFAULT_DATA_SOURCE_OPTIONS = {}

/**
 * An `Application` is, in itself, a container for modules. It is used to group modules together
 * and provide a common context for them. Allowing you to expose all routes, entities, and services
 * of the application in a single place.
 *
 * @template T The modules of the application.
 * @example
 * const application = new Application([
 *   new ModuleUser(),
 *   new ModuleEmail(),
 *   new ModuleSettings(),
 *   new ModuleHealth(),
 * )]
 *
 * // Initialize the application.
 * await application.initialize()
 *
 * // Start the application server.
 * application.createServer().listen(3000)
 */
export class Application<T extends ModuleLike = ModuleLike> {

  /**
   * Is the application initialized.
   */
  isInitialized = false

  /**
   * The `DataSource` of the application. It is used to connect to the database and perform
   * operations on the database. The `DataSource` is used to create repositories and entities
   * that are used in the application.
   */
  dataSource?: DataSource

  /**
   * The modules of the application. These are the modules that are used in the application
   * to perform operations such as sign-in, sign-up, sign-out, as well as other user operations.
   */
  modules = [] as Array<ModuleInstance<T>>

  /**
   * The logger instance of the application. It is used to log messages and errors in the
   * application. The logger is used to log messages to the console, file, or other logging
   * services.
   *
   * @default globalThis.console
   */
  logger = globalThis.console

  /**
   * Instantiate a new application with the given modules and options.
   *
   * @param modules The modules of the application.
   * @param options The options of the application.
   */
  constructor(modules: T[], public options = {} as ApplicationOptions<T>) {

    // --- Instantiate all the modules and store them in the application.
    this.modules = modules.map((module) => {
      const isCtor = isConstructor(module)
      const instance = isCtor ? new (module as Constructor)(options) : module
      return instance as ModuleInstance<T>
    })

    // --- For each module, check if the dependencies are registered in the application.
    for (const module of this.modules) {
      if (!module.dependencies) continue
      for (const dependency of module.dependencies) {
        const found = this.modules.find(m => m instanceof dependency)
        if (!found) {
          throw new Error(dedent(`
            [Application] Missing dependency

            There has been an error initializing the application. The module "${module.constructor.name}"
            expects the module "${dependency.name}" to be registered in the application. Please make sure
            that the module is registered in the application before initializing it.
          `))
        }
      }
    }

    // --- Attach the application reference in the module.
    for (const module of this.modules) module.application = this
  }

  /**
   * Instantiate and initialize a new application with the given modules and options.
   *
   * @param modules The modules of the application.
   * @param options The options of the application.
   * @returns The initialized application.
   * @example
   * const application = await Application.initialize([
   *   new ModuleUser(),
   *   new ModuleEmail(),
   *   new ModuleSettings(),
   *   new ModuleHealth(),
   * ])
   */
  static async initialize<T extends ModuleLike>(modules: T[], options?: ApplicationOptions<T>): Promise<Application<T>> {
    const application = new Application(modules, options)
    await application.initialize()
    return application
  }

  /**
   * All the entities of the application. These are the entities that are used in the application
   * to perform operations on the database. Each entity is associated with a table in the database.
   * The entities are collected from all the modules of the application.
   *
   * @returns The entities of the application.
   * @example
   * const application = new Application([
   *   new ServiceUser(),
   *   new ServiceEmail(),
   * ])
   *
   * // Get all the entities of the application.
   * application.entities // => { User, UserRole, UserSession, UserSettings, Email, EmailTemplate }
   */
  get entities(): InferEntities<T> {
    const entities = this.modules.map(module => module.entities)
    return Object.assign({}, ...entities) as InferEntities<T>
  }

  /**
   * The router of the application. It is generated by collecting all the routes of the
   * various modules registered in the application.
   *
   * @returns The router of the application.
   */
  get router() {
    const router = createRouter()
    const eventHandlers = [] as Array<[string, string, EventHandler]>

    // --- 1. Traverse all registered modules and collect all the routes.
    // --- 2. If the route is a factory function, bind it to the module instance and call it.
    // --- 3. Generate the event handler for each route.
    for (const module of this.modules) {
      if (!module.routes) continue
      for (let route of Object.values(module.routes)) {
        try {
          route = typeof route === 'function' ? route.call(module) : route
          const [method, path] = route.name.split(' ')
          const eventHandler = createEventHandler(route)
          eventHandlers.push([method, path, eventHandler])
        }
        catch (error) {
          this.logger.error('Error creating route:', route)
          this.logger.error(error)
        }
      }
    }

    // --- Sort by path as to avoid conflicts with overlapping paths.
    eventHandlers.sort(([,a], [,b]) => b.length - a.length)
    for (const [method, path, eventHandler] of eventHandlers) {
      // this.logger.debug('Registering route:', method, path)
      const routeMethod = method === 'WS' ? undefined : method.toLowerCase() as RouterMethod
      router.use(path, eventHandler, routeMethod)
    }
    return router
  }

  /**
   * Get an instance of `h3.App` that encapsulates the application
   *
   * @returns The `h3.App` instance of the application.
   */
  @Once()
  createApp() {
    return createApp().use(this.router)
  }

  /**
   * Create a Node.js server with the application handler.
   *
   * @returns The Node.js server with the application handler.
   */
  @Once()
  createServer() {
    const app = this.createApp()
    const listener = toNodeListener(app)
    return createServer(listener)
  }

  /**
   * Initialize the application with the given options.
   */
  @Once()
  async initialize(): Promise<void> {
    if (this.isInitialized) return
    // this.logger.debug('Initializing application...')

    // --- Extract the options.
    const {
      database = process.env.DATABASE ?? 'sqlite',
      databaseName = process.env.DATABASE_NAME ?? './.data/db.sqlite',
      databaseHost = process.env.DATABASE_HOST ?? 'localhost',
      databasePassword = process.env.DATABASE_PASSWORD,
      databasePort = process.env.DATABASE_PORT,
      databaseUser = process.env.DATABASE_USER,
      databaseSsl = process.env.DATABASE_SSL === 'true',
      dataSource,
      dataSourceOptions = {},
    } = this.options

    // --- Initialize the data source.
    this.dataSource = dataSource ?? new DataSource({
      type: database as 'postgres',
      database: databaseName,
      host: databaseHost,
      port: databasePort,
      username: databaseUser,
      password: databasePassword,
      ssl: databaseSsl,
      connectTimeoutMS: 1000,
      synchronize: true,
      ...dataSourceOptions,
      entities: Object.values(this.entities),
    } as DataSourceOptions)

    if (!this.dataSource.isInitialized) {
      await this.dataSource.initialize()
      await this.dataSource.synchronize()
    }

    // --- Initialize all the modules.
    for (const module of this.modules) {
      if (module.isInitialized) continue
      // this.logger.debug('Initializing module:', module.constructor.name)
      await module.initialize()
        .catch((error: Error) => {
          this.logger.error('Error initializing module:', module.constructor.name)
          this.logger.error(error.message)
          this.logger.error(error.stack)
        })
        .then(() => {
          module.isInitialized = true
        })
    }

    // --- Set the application as initialized.
    // this.logger.debug('Application initialized.')
    this.isInitialized = true
  }
}
