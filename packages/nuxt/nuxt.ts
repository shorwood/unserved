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
  async setup(_, { options }) {

    // --- Ensure the Vite config is defined.
    options.vite = options.vite ?? {}
    options.vite.optimizeDeps = options.vite.optimizeDeps ?? {}
    options.vite.optimizeDeps.include = options.vite.optimizeDeps.include ?? []

    // --- Add the imports to the Vite config.
    const imports = await import('./index.js')
    for (const name in imports) {
      if (name === 'default') continue
      options.vite.optimizeDeps.include.push(`@unserved/nuxt/${name}`)
      addImportsSources({ imports: [name], from: `@unserved/nuxt/${name}` })
    }
  },
})
