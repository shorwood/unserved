import type { Awaitable } from '@unshared/functions'
import type { Server } from 'node:http'
import type { ClientOptions } from 'ws'
import type { ApplicationOptions } from '../createApplication'
import type { ModuleLike } from '../types'
import { awaitable, createResolvable } from '@unshared/functions'
import { randomUUID } from 'node:crypto'
import { rm } from 'node:fs/promises'
import { request } from 'node:http'
import { DataSource } from 'typeorm'
import { WebSocket } from 'ws'
import { Application } from '../createApplication'

export interface TestApplicationContext {
  server: Server | undefined
  socketPath: string
  createTestServer(): Promise<void>
  fetch(path: string, options?: RequestInit): Promise<Response>
  connect(path: string): Awaitable<WebSocket, WebSocket>
  destroy(): Promise<void>
  [Symbol.dispose](): Promise<void>
}

export type TestApplication<T extends ModuleLike> = Application<T> & TestApplicationContext

export async function createTestApplication<T extends ModuleLike>(modules: T[] = [], options?: ApplicationOptions<T>): Promise<TestApplication<T>> {
  const id = randomUUID()
  const socketPath = `/tmp/${id}.sock`
  const dataSource = new DataSource({ name: id, type: 'sqlite', synchronize: true, database: ':memory:' })
  const application = await Application.initialize(modules, { ...options, dataSource } as ApplicationOptions<T>)
  let server: Server | undefined

  const context: TestApplicationContext = {
    get server() { return server },
    get socketPath() { return socketPath },

    /************************************************/
    /* Module instances.                            */
    /************************************************/

    async createTestServer(): Promise<void> {
      server = application.createServer({
        onRequest(event) { event.context.clientAddress = '127.0.0.1' },
      })
      await new Promise((resolve, reject) => {
        server!.on('error', reject)
        server!.on('listening', resolve)
        server!.listen(socketPath)
      })
    },

    async fetch(path: string, options: RequestInit = {}): Promise<Response> {
      const { method = 'GET', headers = {}, body } = options
      const resolvable = createResolvable<Response>()
      const clientRequest = request({
        path,
        method,
        socketPath,
        headers: headers as Record<string, string>,
      },

      // --- Handle incoming response.
      (response) => {
        const body = new ReadableStream<Uint8Array>({
          start(controller) {
            response.on('data', (chunk: Uint8Array) => controller.enqueue(chunk))
            response.on('error', error => controller.error(error))
            response.on('end', () => controller.close())
          },
        })

        const bytes = async() => {
          const reader = body.getReader()
          const chunks: Uint8Array[] = []
          while (true) {
            const { done, value } = await reader.read()
            if (done || !value) break
            chunks.push(value)
          }
          const buffer = Buffer.concat(chunks)
          return Uint8Array.from(buffer)
        }

        const text = async() => {
          const buffer = await bytes()
          return [...buffer].map(x => String.fromCodePoint(x)).join('')
        }

        resolvable.resolve({
          ok: response.statusCode! >= 200 && response.statusCode! < 300,
          url: response.url,
          status: response.statusCode!,
          statusText: response.statusMessage!,
          headers: new Headers(response.headers as Record<string, string>),
          body,
          get bodyUsed() { return body.locked },
          bytes,
          text,
          json: () => text().then(JSON.parse),
          arrayBuffer: () => bytes().then(buffer => buffer.buffer),
        } as Response)
      })

      // --- Write the request body.
      if (body) clientRequest.write(body)
      clientRequest.on('error', resolvable.reject)
      clientRequest.end()
      return resolvable.promise
    },

    connect(path: string, options?: ClientOptions): Awaitable<WebSocket, WebSocket> {
      const ws = new WebSocket(`ws+unix:${socketPath}:${path}`, options)
      const ready = () => new Promise<WebSocket>((resolve, reject) => {
        const callbackOpen = () => {
          resolve(ws)
          ws.removeEventListener('open', callbackOpen)
          ws.removeEventListener('error', reject)
        }
        ws.on('open', callbackOpen)
        ws.on('error', reject)
      })
      return awaitable(ws, ready)
    },

    async destroy() {
      if (server) {
        server.closeAllConnections()
        server.close()
        server = undefined
        await rm(socketPath, { force: true })
      }
      if (application.dataSource?.isInitialized)
        await application.dataSource.destroy()
    },

    [Symbol.dispose]() {
      return this.destroy()
    },
  }

  return new Proxy(application, {
    get: (_, name: string) => {
      if (name in context) return context[name as keyof typeof context]
      if (name in application) return application[name as keyof typeof application]
    },
  }) as TestApplication<T>
}
