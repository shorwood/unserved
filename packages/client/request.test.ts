/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable sonarjs/pseudo-random */
import type { RequestDataCallback, RequestErrorCallback, RequestOptionsData } from './request'
import { createError, createHttpRoute, ModuleBase } from '@unserved/server'

describe('request', () => {
  describe('requestOptionsData', () => {
    it('should infer the request data type', () => {

      class ModuleTest extends ModuleBase {
        routes = {
          getFoo: createHttpRoute({
            name: 'GET /test',
            parseParameters: () => ({ foo: 'Hello' }),
            parseQuery: () => ({ bar: 'Hello' }),
            parseBody: () => ({ baz: 'Hello' }),
          }, () => {}),
        }
      }
      type Result = RequestOptionsData<typeof ModuleTest, 'GET /test'>
      expectTypeOf<Result>().toEqualTypeOf<{ foo: string; bar: string; baz: string }>()
    })

    it('should infer the request data type without a module', () => {
      type Result = RequestOptionsData
      expectTypeOf<Result>().toEqualTypeOf<Record<string, unknown>>()
    })
  })

  describe('requestErrorCallback', () => {
    it('should infer the error callback', () => {
      class ModuleTest extends ModuleBase {
        routes = {
          getFoo: createHttpRoute({ name: 'GET /test' }, () => createError({
            name: 'E_TEST',
            message: 'Test error message',
            statusCode: 400,
            statusMessage: 'Bad Request',
            data: { foo: 'bar' },
          })),
        }
      }
      type Result = RequestErrorCallback<typeof ModuleTest, 'GET /test'>
      expectTypeOf<Result>().toEqualTypeOf<(error: { name: 'E_TEST'; message: string; foo: string } | Error) => any>()
    })

    it('should only include the error type in the error callback', () => {
      class ModuleTest extends ModuleBase {
        routes = {
          getFoo: createHttpRoute({ name: 'GET /test' }, () => {
            if (Math.random() > 0.5) return 'Hello'
            return createError({
              name: 'E_TEST',
              message: 'Test error message',
              statusCode: 400,
              statusMessage: 'Bad Request',
              data: { foo: 'bar' },
            })
          }),
        }
      }
      type Result = RequestErrorCallback<typeof ModuleTest, 'GET /test'>
      expectTypeOf<Result>().toEqualTypeOf<(error: { name: 'E_TEST'; message: string; foo: string } | Error) => any>()
    })
  })

  describe('requestDataCallback', () => {
    it('should infer the data callback', () => {
      class ModuleTest extends ModuleBase {
        routes = {
          getFoo: createHttpRoute({ name: 'GET /test' }, () => 'Hello'),
        }
      }
    type Result = RequestDataCallback<typeof ModuleTest, 'GET /test'>
    expectTypeOf<Result>().toEqualTypeOf<(data: string) => any>()
    })

    it('should exclude the error type from the data callback', () => {

      class ModuleTest extends ModuleBase {
        routes = {
          getFoo: createHttpRoute({ name: 'GET /test' }, () => {
            if (Math.random() > 0.5) return 'Hello'
            return createError({
              name: 'E_TEST',
              message: 'Test error message',
              statusCode: 400,
              statusMessage: 'Bad Request',
              data: { foo: 'bar' },
            })
          }),
        }
      }
    type Result = RequestDataCallback<typeof ModuleTest, 'GET /test'>
    expectTypeOf<Result>().toEqualTypeOf<(data: 'Hello') => any>()
    })
  })
})
