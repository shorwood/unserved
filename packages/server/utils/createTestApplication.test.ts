/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable sonarjs/publicly-writable-directories */
import { type Dirent, existsSync } from 'node:fs'
import { opendir } from 'node:fs/promises'
import { Server } from 'node:http'
import { WebSocket } from 'ws'
import { Application } from '../createApplication'
import { createHttpRoute } from '../createHttpRoute'
import { ModuleBase } from '../createModule'
import { createWebSocketRoute } from '../createWebSocketRoute'
import { createTestApplication } from './createTestApplication'

vi.unmock('node:fs')
vi.unmock('node:fs/promises')

describe('createTestApplication', () => {
  interface ModuleTestOptions { name?: string }
  class ModuleTest extends ModuleBase {
    constructor(options: ModuleTestOptions = {}) {
      super()
      if (options.name) this.name = options.name
    }

    name = 'World'
    routes = {
      greet: createHttpRoute({ name: 'GET /' }, () => `Hello, ${this.name}!`),
      setName: createHttpRoute({ name: 'POST /', parseBody: data => data as { name: string } }, ({ body }) => { this.name = body.name }),
      getName: createHttpRoute({ name: 'GET /name' }, () => ({ name: this.name })),
      ws: createWebSocketRoute({ name: 'WS /ws', parseClientMessage: data => data as { greet: string } }, {
        onOpen({ peer }) { peer.send('Connected!') },
        onMessage: ({ peer, message }) => { peer.send(`${message.greet}, ${this.name}!`) },
      }),
    }
  }

  describe('instance', () => {
    it('should create an instance of Application', async() => {
      using application = await createTestApplication()
      expect(application).toBeInstanceOf(Application)
    })

    it('should create an instance of the module', async() => {
      using application = await createTestApplication([ModuleTest])
      expect(application.modules).toHaveLength(1)
      expect(application.modules[0]).toBeInstanceOf(ModuleTest)
    })

    it('should pass the options to the module', async() => {
      using application = await createTestApplication([ModuleTest], { name: 'Universe' })
      expect(application.modules[0].name).toBe('Universe')
    })
  })

  describe('dataSource', () => {
    it('should create a DataSource', async() => {
      using application = await createTestApplication()
      expect(application.dataSource).toBeDefined()
    })

    it('should initialize the DataSource', async() => {
      using application = await createTestApplication()
      expect(application.dataSource?.isInitialized).toBe(true)
    })

    it('should use an in-memory database', async() => {
      using application = await createTestApplication()
      expect(application.dataSource?.options).toStrictEqual({
        name: expect.any(String),
        type: 'sqlite',
        synchronize: true,
        database: ':memory:',
        entities: [],
      })
    })
  })

  describe('server', () => {
    it('should create an HTTP server', async() => {
      using application = await createTestApplication()
      await application.createTestServer()
      expect(application.server).toBeInstanceOf(Server)
    })

    it('should store the socket path', async() => {
      using application = await createTestApplication()
      await application.createTestServer()
      expect(application.socketPath).toMatch(/\/tmp\/[\da-f-]+\.sock/)
    })

    it('should create a socket file', async() => {
      using application = await createTestApplication()
      await application.createTestServer()
      const { socketPath } = application
      const dir = await opendir('/tmp')
      const path = socketPath.replace('/tmp/', '')
      let socket: Dirent
      for await (const entry of dir) {
        if (entry.name !== path) continue
        socket = entry
        break
      }
      const isSocket = socket!.isSocket()
      expect(isSocket).toBe(true)
    })
  })

  describe('fetch http', () => {
    it('should fetch and get the status', async() => {
      using application = await createTestApplication([ModuleTest])
      await application.createTestServer()
      const response = await application.fetch('/')
      expect(response.status).toBe(200)
      expect(response.statusText).toBe('OK')
    })

    it('should fetch and get the headers', async() => {
      using application = await createTestApplication([ModuleTest])
      await application.createTestServer()
      const response = await application.fetch('/')
      // @ts-expect-error: Headers is iterable.
      const headers = Object.fromEntries(response.headers)
      expect(response.headers).toBeInstanceOf(Headers)
      expect(headers).toStrictEqual({
        'connection': 'keep-alive',
        'content-length': '13',
        'content-type': 'text/html',
        'date': expect.any(String),
        'keep-alive': 'timeout=5',
      })
    })

    it('should fetch and get the body as a stream', async() => {
      using application = await createTestApplication([ModuleTest])
      await application.createTestServer()
      const response = await application.fetch('/')
      const body = response.body
      const text = await new Response(body).text()
      expect(body).toBeInstanceOf(ReadableStream)
      expect(text).toBe('Hello, World!')
    })

    it('should fetch and get body as text', async() => {
      using application = await createTestApplication([ModuleTest])
      await application.createTestServer()
      const response = await application.fetch('/', { method: 'GET' })
      const text = await response.text()
      expect(text).toBe('Hello, World!')
    })

    it('should fetch and get body as JSON', async() => {
      using application = await createTestApplication([ModuleTest])
      await application.createTestServer()
      const response = await application.fetch('/name', { method: 'GET' })
      const json = await response.json()
      expect(json).toStrictEqual({ name: 'World' })
    })

    it('should fetch and get body as bytes', async() => {
      using application = await createTestApplication([ModuleTest])
      await application.createTestServer()
      const response = await application.fetch('/', { method: 'GET' })
      const bytes = await response.bytes()
      const expected = Uint8Array.from(Buffer.from('Hello, World!'))
      expect(bytes).toStrictEqual(expected)
    })

    it('should fetch and get body as array buffer', async() => {
      using application = await createTestApplication([ModuleTest])
      await application.createTestServer()
      const response = await application.fetch('/', { method: 'GET' })
      const buffer = await response.arrayBuffer()
      const expected = Uint8Array.from(Buffer.from('Hello, World!')).buffer
      expect(buffer).toStrictEqual(expected)
    })

    it('should set the "bodyUsed" property when reading the body', async() => {
      using application = await createTestApplication([ModuleTest])
      await application.createTestServer()
      const response = await application.fetch('/')
      expect(response.bodyUsed).toBe(false)
      await response.text()
      expect(response.bodyUsed).toBe(true)
    })
  })

  describe('fetch websocket', () => {
    it('should connect to the WebSocket', async() => {
      using application = await createTestApplication([ModuleTest])
      await application.createTestServer()
      const ws = await application.connect('/ws')
      expect(ws).toBeInstanceOf(WebSocket)
    })

    it('should reveice message when opening', async() => {
      using application = await createTestApplication([ModuleTest])
      await application.createTestServer()
      const callback = vi.fn()
      const ws = application.connect('/ws')
      ws.on('message', callback)
      await new Promise(resolve => setTimeout(resolve, 10))
      expect(callback).toHaveBeenCalledOnce()
      expect(callback).toHaveBeenCalledWith(Buffer.from('Connected!'), false)
    })

    it('should send and receive a message', async() => {
      using application = await createTestApplication([ModuleTest])
      await application.createTestServer()
      const ws = await application.connect('/ws')
      const callback = vi.fn()
      ws.on('message', callback)
      ws.send(JSON.stringify({ greet: 'Hi' }))
      await new Promise(resolve => setTimeout(resolve, 10))
      expect(callback).toHaveBeenCalledOnce()
      expect(callback).toHaveBeenCalledWith(Buffer.from('Hi, World!'), false)
    })
  })

  describe('destroy', () => {
    it('should delete the socket when destroyed', async() => {
      using application = await createTestApplication()
      await application.createTestServer()
      await application.destroy()
      const socketExists = existsSync(application.socketPath)
      expect(socketExists).toBe(false)
    })

    it('should close the server when destroyed', async() => {
      using application = await createTestApplication()
      await application.createTestServer()
      const callback = vi.fn()
      application.server!.on('close', callback)
      await application.destroy()
      expect(callback).toHaveBeenCalled()
    })

    it('should dereference the server when destroyed', async() => {
      using application = await createTestApplication()
      await application.createTestServer()
      await application.destroy()
      expect(application.server).toBeUndefined()
    })

    it('should destroy the dataSource when destroyed', async() => {
      using application = await createTestApplication()
      await application.createTestServer()
      await application.destroy()
      expect(application.dataSource?.isInitialized).toBe(false)
    })

    it('should destroy the application when disposed', async() => {
      using application = await createTestApplication()
      await application.createTestServer()
      await application[Symbol.dispose]()
      expect(application.server).toBeUndefined()
    })
  })
})
