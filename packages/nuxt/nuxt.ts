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
  async setup() {
    const imports = await import('./index.js')
    for (const name in imports) {
      if (name === 'default') continue
      addImportsSources({ imports: [name], from: `@unserved/nuxt/${name}` })
    }
  },
})
