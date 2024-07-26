import { createError } from 'h3'

export const ERRORS = {
  E_FORM_NOT_FOUND: (idOrSlug: string) => createError({
    name: 'E_FORM_NOT_FOUND',
    message: `Could not find the form with the id or slug "${idOrSlug}".`,
    statusMessage: 'Not Found',
    statusCode: 404,
  }),

  E_FORM_SUBMISSION_NOT_FOUND: (id: string) => createError({
    name: 'E_FORM_SUBMISSION_NOT_FOUND',
    message: `Could not find the form submission with the id "${id}".`,
    statusMessage: 'Not Found',
    statusCode: 404,
  }),
}
