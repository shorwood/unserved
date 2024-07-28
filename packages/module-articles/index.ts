import { ModuleBase } from '@unserved/server'
import { ModuleUser } from '@unserved/module-user'
import { ModuleStorage } from '@unserved/module-storage'
import * as ENTITIES from './entities'

export * from './entities'

export class ModuleActicles extends ModuleBase {
  entities = ENTITIES
  dependencies = [ModuleUser, ModuleStorage]
}
