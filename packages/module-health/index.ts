import { ModuleBase, createRoute } from '@unserve/server'

export class ModuleHealth extends ModuleBase {
  routes = {
    health: () => createRoute('GET /api/health', () => {
      const moduleStatusEntries = this.application!.modules.map(module => [
        module.constructor.name,
        module.isInitialized,
      ])

      return {
        application: this.application?.isInitialized,
        dataSource: this.application!.dataSource?.isInitialized,
        modules: Object.fromEntries(moduleStatusEntries) as Record<string, boolean>,
      }
    }),
  }
}
