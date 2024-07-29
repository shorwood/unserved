import { createError } from 'h3'

export const ERRORS = {
  LOCALE_NOT_FOUND: (id: string) => createError({
    name: 'E_LOCALE_NOT_FOUND',
    message: `Could not find the locale with the id "${id}".`,
    statusMessage: 'Not Found',
    statusCode: 404,
  }),
}
