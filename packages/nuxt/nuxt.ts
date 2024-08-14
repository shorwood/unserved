import { addComponent, addImportsSources, defineNuxtModule } from '@nuxt/kit'

export default defineNuxtModule({
  meta: {
    name: '@unserved/nuxt',
    configKey: '@unserved/nuxt',
    compatibility: {
      nuxt: '>=3.0.0',
      bridge: false,
    },
  },
  async setup() {
    const imports = await import('./index.js')
    for (const name in imports) {
      if (name === 'default') continue

      // --- By convention, exports starting with `Base` are components.
      // --- Anything else is either a composable or utility function.
      if (name.startsWith('Base'))
        await addComponent({ name, export: name, filePath: `@unserved/nuxt/${name}` })
      else
        addImportsSources({ imports: [name], from: `@unserved/nuxt/${name}` })
    }
  },
})
