import type { Pretty } from '@unshared/types'
import type { H3Error, StatusCode } from 'h3'
import { createError as createH3Error } from 'h3'

/** A standardized error name. */
export type ErrorName = `E_${Uppercase<string>}`

/** The options to create an error object. */
export interface CreateErrorOptions<N extends ErrorName, T extends object> {
  name: N
  data?: T
  statusCode: StatusCode
  statusMessage: string
  message: string
}

/** The data of an error object. */
export type ErrorData<N extends ErrorName = ErrorName, T extends object = object> =
  Pretty<{ name: N; message: string } & T>

/** An extended `H3Error` with a name and message. */
export type Error<N extends ErrorName = ErrorName, T extends object = object> =
  H3Error<ErrorData<N, T>>

/**
 * Create a standardized error object with a status code, status text, message, and data.
 *
 * @param options The options to create the error object.
 * @returns The error object with the given options.
 */
export function createError<N extends ErrorName, T extends object = object>(options: CreateErrorOptions<N, T>): Error<N, T> {
  return createH3Error({
    statusCode: options.statusCode,
    statusMessage: options.statusMessage,
    message: options.message,
    data: { ...options.data, name: options.name, message: options.message } as T,
  }) as Error<N, T>
}

/* v8 ignore start */
if (import.meta.vitest) {
  test('should create an error object with a status code and message', () => {
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

  test('should create an error object with a name and message', () => {
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

  test('should create an error object with data', () => {
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

  test('should infer the error name', () => {
    const result = createError({ name: 'E_TEST', statusCode: 400, statusMessage: 'Bad Request', message: 'This is a test error' })
    expectTypeOf(result).toEqualTypeOf<Error<'E_TEST', object>>()
  })

  test('should infer the error data', () => {
    const result = createError({ name: 'E_TEST', statusCode: 400, statusMessage: 'Bad Request', message: 'This is a test error', data: { foo: 'bar' } })
    expectTypeOf(result).toEqualTypeOf<Error<'E_TEST', { foo: string }>>()
  })
}
