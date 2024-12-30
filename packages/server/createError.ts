import type { Pretty } from '@unshared/types'
import type { H3Error, StatusCode } from 'h3'
import { createError as createH3Error } from 'h3'

/** A standardized error name. */
export type ServerErrorName = `E_${Uppercase<string>}`

/** The options to create an error object. */
export interface CreateErrorOptions<N extends ServerErrorName, T extends object> {
  name: N
  data?: T
  statusCode: StatusCode
  statusMessage: string
  message: string
}

/** The data of an error object. */
export type ServerErrorData<N extends ServerErrorName = ServerErrorName, T extends object = object> =
  Pretty<T & { name: N; message: string }>

/** An extended `H3Error` with a name and message. */
export type ServerError<N extends ServerErrorName = ServerErrorName, T extends object = object> =
  H3Error<ServerErrorData<N, T>>

/**
 * Create a standardized error object with a status code, status text, message, and data.
 *
 * @param options The options to create the error object.
 * @returns The error object with the given options.
 */
export function createError<N extends ServerErrorName, T extends object = object>(options: CreateErrorOptions<N, T>): ServerError<N, T> {
  return createH3Error({
    statusCode: options.statusCode,
    statusMessage: options.statusMessage,
    message: options.message,
    data: { ...options.data, name: options.name, message: options.message } as T,
  }) as ServerError<N, T>
}
