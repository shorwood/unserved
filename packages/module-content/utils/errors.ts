import { createError } from 'h3'

export const ERRORS = {
  CONTENT_PAGE_NOT_FOUND: (id: string) => createError({
    name: 'E_CONTENT_PAGE_NOT_FOUND',
    message: `Could not find content page with ID or slug "${id}".`,
    statusMessage: 'Not Found',
    statusCode: 404,
  }),

  CONTENT_LANGUAGE_NOT_FOUND: (id: string) => createError({
    name: 'E_CONTENT_LANGUAGE_NOT_FOUND',
    message: `Could not find content language with ID "${id}".`,
    statusMessage: 'Not Found',
    statusCode: 404,
  }),

  CONTENT_WEBSITE_NOT_FOUND: () => createError({
    name: 'E_CONTENT_WEBSITE_NOT_FOUND',
    message: 'The website entity could not be found.',
    statusMessage: 'Not Found',
    statusCode: 404,
  }),
}
