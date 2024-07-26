import { ModuleBase } from '@unserve/server'
import { ModuleUser } from '@unserve/module-user'
import { ModuleStorage } from '@unserve/module-storage'
import * as ENTITIES from './entities'

export * from './entities'

export class ModuleActicles extends ModuleBase {
  entities = ENTITIES
  dependencies = [ModuleUser, ModuleStorage]
}
