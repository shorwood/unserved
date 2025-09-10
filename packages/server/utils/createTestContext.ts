import type { Awaitable } from '@unshared/functions'
import type { Server } from 'node:http'
import type { ClientOptions } from 'ws'
import type { Application } from '../createApplication'
import type { ModuleLike } from '../types'
import { awaitable, createResolvable } from '@unshared/functions'
import { randomUUID } from 'node:crypto'
import { rm } from 'node:fs/promises'
import { request } from 'node:http'
import { WebSocket } from 'ws'

/** The test context methods and properties. */
interface TestContext {
  server: Server | undefined
  socketPath: string
  createTestServer(): Promise<void>
  fetch(path: string, options?: RequestInit): Promise<Response>
  ws(path: string): Awaitable<WebSocket, WebSocket>
  destroy(): Promise<void>
  [Symbol.dispose](): Promise<void>
}

/** An application that has been augmented with the test context methods and properties. */
export type ApplicationWithTestContext<T extends ModuleLike> = Application<T> & TestContext

/**
 * Create a test context for the given application. This will create an in-memory
 * database and a test server that listens on a Unix socket. The context provides
 * methods to create the test server, make HTTP requests, and create WebSocket
 * connections. The context also provides a destroy method to clean up resources.
 *
 * The application will be initialized automatically when the context is created.
 *
 * @param application The application to create the test context for.
 * @returns An awaitable that resolves to the application with the test context.
 * @example
 *
 * const application = new Application([MyModule])
 * using context = createTestContext(application)
 * await context.createTestServer()
 *
 * // Make HTTP requests to the test server.
 * const response = await context.fetch('/api/endpoint')
 * const data = await response.json()
 */
export function createTestContext<T extends ModuleLike>(application: Application<T>): Awaitable<
  ApplicationWithTestContext<T>,
  ApplicationWithTestContext<T>
> {
  const id = randomUUID()
  const socketPath = `/tmp/${id}.sock`
  let server: Server | undefined

  // --- Assert that the application has not been initialized.
  if (application.isInitialized)
    throw new Error('The application has already been initialized. Please create the test context before initializing the application.')

  // --- Override the data source to use an in-memory database.
  application.options.dataSource = {
    type: 'sqlite',
    database: ':memory:',
    synchronize: true,
  }

  // --- Implement the context methods and properties.
  const context: TestContext = {
    get server() { return server },
    get socketPath() { return socketPath },

    // --- Create and start the test server.
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

    // --- Make an HTTP request to the test server. This is a minimal fetch implementation
    // --- that will point to the internal Unix socket used by the test server. Allowing us
    // --- to avoid using a local port and avoid potential conflicts.
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

    // --- Create a WebSocket connection to the test server. Like fetch, this uses the
    // --- internal Unix socket to avoid using a local port.
    ws(path: string, options?: ClientOptions): Awaitable<WebSocket, WebSocket> {
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

    // --- Destroy the test server and database connection.
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

    // --- Support using the context in a `using` statement.
    [Symbol.dispose]() {
      return this.destroy()
    },
  }

  // --- Return a proxy that merges the application and context.
  const applicationWithContext = new Proxy(application, {
    get: (_, name: string) => {
      if (name in context) return context[name as keyof typeof context]
      if (name in application) return application[name as keyof typeof application]
    },
  }) as ApplicationWithTestContext<T>

  // --- Return an awaitable that initializes the application.
  return awaitable(applicationWithContext, async() => {
    if (!application.isInitialized) await application.initialize()
    return applicationWithContext
  })
}
