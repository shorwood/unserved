import { DataSource, DataSourceOptions } from 'typeorm'
import { createServer } from 'node:http'
import { EventHandler, RouterMethod, createApp, createRouter, toNodeListener } from 'h3'
import { Constructor } from '@unshared/types'
import { dedent } from '@unshared/string'
import { parseEnvironmentVariables } from '@unshared/process'
import { isConstructor } from '@unshared/functions'
import { Once } from '@unshared/decorators'
import { InferEntities, InferOptions, ModuleInstance, ModuleLike } from './types'
import { createEventHandler } from './createEventHandler'

export type ApplicationOptions<T extends ModuleLike> = {

  /**
   * The logger instance of the application. It is used to log messages and errors in the
   * application. The logger is used to log messages to the console, file, or other logging
   * services.
   *
   * @default globalThis.console
   */
  logger?: Console

  /**
   * The data source of the application. It is used to connect to the database and perform
   * operations on the database. The data source is used to create repositories and entities
   * that are used in the application.
   *
   * @default { type: 'sqlite', database: ':memory:', synchronize: true }
   */
  dataSource?: DataSource | DataSourceOptions
} & InferOptions<T>

export const DEFAULT_DATA_SOURCE_OPTIONS: DataSourceOptions = {
  type: 'sqlite',
  database: ':memory:',
  synchronize: true,
}

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
   *
   * @default false
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

    // --- Set the logger of the application.
    if (options.logger) this.logger = options.logger

    // --- Merge the options of the application with the options from
    // --- the environment variables.
    this.options = {
      ...this.options,
      ...parseEnvironmentVariables('APP'),
      dataSource: {
        ...DEFAULT_DATA_SOURCE_OPTIONS,
        ...parseEnvironmentVariables('DATABASE'),
      },
    }

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
    return new Application(modules, options).initialize()
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
   * Get the given module from the application. This is used to get the module instance
   * from the application context. It will throw an error if the module is not found.
   *
   * @param module The constructor of the module to get.
   * @returns The module instance.
   */
  getModule<T extends Constructor>(module: T): InstanceType<T> {
    const result = this.modules.find(m => m instanceof module)
    if (!result) throw new Error('Module not found')
    if (result.isInitialized === false) throw new Error('Module not initialized')
    return result as InstanceType<T>
  }

  /**
   * Instantiate the router of the application. The router is used to handle HTTP requests
   * and route them to the appropriate event handler. This function will collect all routes
   * from the registered modules and generate the event handlers for each route.
   *
   * @returns The router of the application.
   */
  @Once()
  createRouter() {
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
   * Instantiate the H3 application of the application with the router handler.
   *
   * @returns The H3 application of the application.
   */
  @Once()
  createApp() {
    const router = this.createRouter()
    return createApp().use(router)
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
   *
   * @returns The initialized application.
   */
  @Once()
  async initialize(): Promise<this> {
    if (this.isInitialized) return this
    // this.logger.debug('Initializing application...')

    // --- Initialize the data source and inject the entities from the modules.
    const { dataSource = DEFAULT_DATA_SOURCE_OPTIONS } = this.options
    this.dataSource = dataSource instanceof DataSource ? dataSource : new DataSource(dataSource)
    this.dataSource.setOptions({ ...this.dataSource.options, entities: Object.values(this.entities) })
    if (!this.dataSource.isInitialized) await this.dataSource.initialize()

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
    return this
  }
}

/* v8 ignore start */
if (import.meta.vitest) {
  const { ModuleUser, User, UserRole, UserGroup, UserSession, UserSettings } = await import('../module-user/index')

  test('should create a new application instance', () => {
    const application = new Application([])
    expect(application).toBeInstanceOf(Application)
  })

  test('should map of entities registered in all the modules of the application', () => {
    const application = new Application([ModuleUser])
    const repositories = application.entities
    expect(repositories).toStrictEqual({ User, UserRole, UserGroup, UserSession, UserSettings })
  })

  test('should initialize a DataSource with the entities from the modules', async() => {
    const application = new Application([ModuleUser])
    await application.initialize()
    expect(application.dataSource).toBeInstanceOf(DataSource)
  })
}
