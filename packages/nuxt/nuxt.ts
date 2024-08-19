import { addImportsSources, defineNuxtModule } from '@nuxt/kit'

export default defineNuxtModule({
  meta: {
    name: '@unserved/nuxt',
    configKey: '@unserved/nuxt',
    compatibility: {
      nuxt: '>=3.12.0',
      bridge: false,
    },
  },
  setup(_, { options }) {

    // --- Define the modules to import.
    const imports = {
      useRequest: '@unserved/nuxt/useRequest',
      useClient: '@unserved/nuxt/useClient',
    }

    // --- Ensure the Vite config is defined.
    options.vite = options.vite ?? {}
    options.vite.optimizeDeps = options.vite.optimizeDeps ?? {}
    options.vite.optimizeDeps.include = options.vite.optimizeDeps.include ?? []
    options.vite.optimizeDeps.exclude = options.vite.optimizeDeps.exclude ?? []

    // --- Add the imports to the Vite config.
    addImportsSources({
      from: '@unserved/nuxt',
      imports: Object.entries(imports).map(([name, from]) => ({ name, from })),
    })
  },
})
