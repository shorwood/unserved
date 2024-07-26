import { createError } from 'h3'

export const ERRORS = {
  ORGANIZATION_NOT_FOUND: (idOrSlig: string) => createError({
    name: 'E_ORGANIZATION_NOT_FOUND',
    message: `Organization "${idOrSlig}" not found.`,
    statusText: 'Not Found',
    statusCode: 404,
  }),
}
