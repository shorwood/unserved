import type { Constructor, Function } from '@unshared/types'
import type { EntityTarget, Repository } from 'typeorm'
import type { Application } from './createApplication'
import type { HttpRoute, HttpRouteOptions } from './createHttpRoute'
import type { ModuleBase } from './createModule'
import type { WebSocketRoute } from './createWebSocketRoute'

/** A parser for the body, query, and parameters of the route. */
export type Parser<T = any, V = any> = (value: V) => T

/** A route that is either an `HttpRoute` or a `WebSocketRoute`. */
export type Route = HttpRoute<HttpRouteOptions, any> | WebSocketRoute

/** A constructor of instance of a module. */
export type ModuleLike = ModuleBase | typeof ModuleBase

/** Inferable types of an application or module. */
export type ApplicationOrModule = Application | ModuleLike | typeof Application

/**
 * Get a union of all the instances of the given module classes. If
 * the module class is a constructor, it will return the instance type.
 *
 * @template T The module class or constructor.
 * @example type Modules<typeof ModuleUser | ModuleStorage> // => ModuleUser | ModuleStorage
 */
export type ModuleInstance<T> =
  T extends Application<infer R> ? ModuleInstance<R>
    : T extends typeof ModuleBase ? InstanceType<T> : T

/**
 * Infer the the module of the application.
 *
 * @template T The application to infer the routes from.
 * @returns A union of the modules in the application.
 * @example type AppModule = ApplicationModule<App> // ModuleHealth | ModuleUser
 */
export type ModuleConstructor<T> =
  T extends Application<infer R> ? R
    : T extends typeof ModuleBase ? T
      : never

/**
 * Infer the options of an application or module instance.
 *
 * @template T The module class or constructor.
 */
export type InferOptions<T> =
  ModuleConstructor<T> extends Constructor<ModuleBase, [infer U | undefined]>
    ? Partial<{ [K in Exclude<keyof U, keyof ModuleBase>]-?: Exclude<U[K], Function | undefined> }>
    : never

/**
 * Given an application or module, infer the map of repositories in the module or application.
 *
 * @template T The application or module to infer the repositories from.
 * @example InferRepositories<typeof ModuleUser | ModuleStorage> // => Repository<User> | Repository<UserRole> | ...
 */
export type InferRepositories<T> =
  ModuleInstance<T> extends { entities: infer Entities }
    ? {
      [K in keyof Entities]:
      Entities[K] extends EntityTarget<infer U extends object>
        ? Repository<U>
        : never
    }
    : []
