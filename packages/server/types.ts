import type { Constructor, Function, UnionMerge } from '@unshared/types'
import type { EntityTarget, Repository } from 'typeorm'
import type { Application } from './createApplication'
import type { ModuleBase } from './createModule'

/** A constructor of instance of a module. */
export type ModuleLike = ModuleBase | typeof ModuleBase

/** Inferable types of an application or module. */
export type ApplicationOrModule = Application | ModuleLike | typeof Application

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
  T extends Application<infer R> ? ModuleInstance<R>
    : T extends typeof ModuleBase ? InstanceType<T> : T

/**
 * Infer the the module of the application.
 *
 * @template T The application to infer the routes from.
 * @returns A union of the modules in the application.
 * @example type AppModule = ApplicationModule<App> // ModuleHealth | ModuleUser
 */
export type ModuleConstructor<T extends ApplicationOrModule> =
  T extends Application<infer R> ? R
    : T extends typeof ModuleBase ? T
      : never

/**
 * Infer the options of an application or module instance.
 *
 * @template T The module class or constructor.
 */
export type InferOptions<T extends ApplicationOrModule> =
  ModuleConstructor<T> extends Constructor<ModuleBase, [infer U | undefined]>
    ? Partial<{ [K in Exclude<keyof U, keyof ModuleBase>]-?: Exclude<U[K], Function | undefined> }>
    : never

/**
 * Given an application or module, infer the map of repositories in the module or application.
 *
 * @template T The application or module to infer the repositories from.
 * @example InferRepositories<typeof ModuleUser | ModuleStorage> // => Repository<User> | Repository<UserRole> | ...
 */
export type InferRepositories<T extends ApplicationOrModule> =
  UnionMerge<ModuleInstance<T> extends { entities: infer Entities } ? {
    [K in keyof Entities]: Entities[K] extends EntityTarget<infer U extends object> ? Repository<U> : never
  } : []>

/* v8 ignore start */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-object-type */
if (import.meta.vitest) {
  const { Application } = await import('./createApplication')
  const { ModuleBase } = await import('./createModule')
  const { BaseEntity } = await import('./BaseEntity')

  class User extends BaseEntity { name = 'User' }
  class ModuleUser extends ModuleBase {
    constructor(options?: { name: string }) { super() }
    entities = { User }
  }
  const moduleUser = new ModuleUser({ name: 'User' })
  const application = new Application([ModuleUser])

  describe('moduleInstance', () => {
    it('should infer the module of a module constructor', () => {
      type Result = ModuleInstance<typeof ModuleUser>
      type Expected = InstanceType<typeof ModuleUser>
      expectTypeOf<Result>().toEqualTypeOf<Expected>()
    })

    it('should infer the module of a module instance', () => {
      type Result = ModuleInstance<typeof moduleUser>
      type Expected = InstanceType<typeof ModuleUser>
      expectTypeOf<Result>().toEqualTypeOf<Expected>()
    })

    it('should infer the module of an application instance', () => {
      type Result = ModuleInstance<typeof application>
      type Expected = InstanceType<typeof ModuleUser>
      expectTypeOf<Result>().toEqualTypeOf<Expected>()
    })
  })

  describe('inferModule', () => {
    it('should infer the module of a module constructor', () => {
      type Result = ModuleConstructor<typeof ModuleUser>
      expectTypeOf<Result>().toEqualTypeOf<typeof ModuleUser>()
    })

    it('should infer the module of a module instance', () => {
      type Result = ModuleConstructor<typeof moduleUser>
      expectTypeOf<Result>().toEqualTypeOf<never>()
    })

    it('should infer the module of an application instance', () => {
      type Result = ModuleConstructor<typeof application>
      expectTypeOf<Result>().toEqualTypeOf<typeof ModuleUser>()
    })
  })

  describe('inferOptions', () => {
    it('should infer the options of a module constructor', () => {
      type Result = InferOptions<typeof ModuleUser>
      expectTypeOf<Result>().toEqualTypeOf<{ name?: string }>()
    })

    it('should infer the options of a module instance', () => {
      type Result = InferOptions<typeof moduleUser>
      expectTypeOf<Result>().toEqualTypeOf<{}>()
    })

    it('should infer the options of an application instance', () => {
      type Result = InferOptions<typeof application>
      expectTypeOf<Result>().toEqualTypeOf<{ name?: string }>()
    })
  })

  describe('inferRepositories', () => {
    it('should infer the repositories of a module constructor', () => {
      type Result = InferRepositories<typeof ModuleUser>
      expectTypeOf<Result>().toEqualTypeOf<{ User: Repository<User> }>()
    })

    it('should infer the repositories of a module instance', () => {
      type Result = InferRepositories<typeof moduleUser>
      expectTypeOf<Result>().toEqualTypeOf<{ User: Repository<User> }>()
    })

    it('should infer the repositories of an application instance', () => {
      type Result = InferRepositories<typeof application>
      expectTypeOf<Result>().toEqualTypeOf<{ User: Repository<User> }>()
    })
  })
}
