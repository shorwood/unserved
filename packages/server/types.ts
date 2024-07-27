/* eslint-disable @typescript-eslint/consistent-type-imports */
import type { Constructor, Function, UnionMerge } from '@unshared/types'
import { ModuleBase } from './createModule'
import type { Application } from './createApplication'

/** A constructor of instance of a module. */
export type ModuleLike = ModuleBase | typeof ModuleBase

/** Inferable types of an application or module. */
export type ApplicationOrModule = Application | ModuleLike

/** A permission object. */
export interface PermissionObject {
  id: string
  name: string
  description?: string
}

/**
 * Get a union of all the instances of the given module classes. If
 * the module class is a constructor, it will return the instance type.
 *
 * @template T The module class or constructor.
 * @example type Modules<typeof ModuleUser | ModuleStorage> // => ModuleUser | ModuleStorage
 */
export type ModuleInstance<T extends ApplicationOrModule> =
  T extends typeof ModuleBase ? InstanceType<T> : T

/**
 * Infer the options of an application or module instance.
 *
 * @template T The module class or constructor.
 */
export type InferOptions<T extends ApplicationOrModule> =
  Partial<UnionMerge<InferModule<T> extends Constructor<ModuleBase, [infer U | undefined]>
    ? { [K in Exclude<keyof U, keyof ModuleBase>]-?: Exclude<U[K], Function | undefined> }
    : {}>>

/**
 * Given an application or module, infer the map of entities in the module or application.
 *
 * @template T The application or module to infer the entities from.
 * @example InferEntities<typeof ModuleUser | ModuleStorage> // => User | UserRole | Asset | ...
 */
export type InferEntities<T extends ApplicationOrModule> =
  UnionMerge<ModuleInstance<T> extends { entities: infer Entities } ? Entities : []>

/**
 * Infer the the module of the application.
 *
 * @template T The application to infer the routes from.
 * @returns A union of the modules in the application.
 * @example type AppModule = ApplicationModule<App> // ModuleHealth | ModuleUser
 */
export type InferModule<T extends ApplicationOrModule> =
  T extends Application<infer R> ? ModuleInstance<R> : T
