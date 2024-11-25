import type { ServerError } from './createError'
import { createError } from './createError'

describe('createError', () => {
  it('should create an error object with a status code and message', () => {
    const error = createError({
      name: 'E_TEST',
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'This is a test error',
    })
    expect(error).toMatchObject({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'This is a test error',
    })
  })

  it('should create an error object with a name and message', () => {
    const error = createError({
      name: 'E_TEST',
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'This is a test error',
    })
    expect(error.data).toStrictEqual({
      name: 'E_TEST',
      message: 'This is a test error',
    })
  })

  it('should create an error object with data', () => {
    const error = createError({
      name: 'E_TEST',
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'This is a test error',
      data: { foo: 'bar' },
    })
    expect(error.data).toStrictEqual({
      name: 'E_TEST',
      message: 'This is a test error',
      foo: 'bar',
    })
  })

  it('should infer the error name', () => {
    const result = createError({ name: 'E_TEST', statusCode: 400, statusMessage: 'Bad Request', message: 'This is a test error' })
    expectTypeOf(result).toEqualTypeOf<ServerError<'E_TEST', object>>()
  })

  it('should infer the error data', () => {
    const result = createError({ name: 'E_TEST', statusCode: 400, statusMessage: 'Bad Request', message: 'This is a test error', data: { foo: 'bar' } })
    expectTypeOf(result).toEqualTypeOf<ServerError<'E_TEST', { foo: string }>>()
  })
})
