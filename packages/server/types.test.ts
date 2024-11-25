/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Repository } from 'typeorm'
import type { InferOptions, InferRepositories, ModuleConstructor, ModuleInstance } from './types'
import { BaseEntity } from './BaseEntity'
import { Application } from './createApplication'
import { ModuleBase } from './createModule'

describe('types', () => {
/* eslint-disable @typescript-eslint/no-empty-object-type */

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
})
