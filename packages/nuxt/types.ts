import type { Application } from '@unserved/server'

declare module '@unserved/server' {
  interface Server {
    application: Application
  }
}
