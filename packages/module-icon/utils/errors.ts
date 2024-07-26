import { createError } from 'h3'

export const ERRORS = {
  ICON_NOT_FOUND: (name: string) => createError({
    name: 'E_ICON_ICON_NOT_FOUND',
    message: `Icon "${name}" not found`,
    statusText: 'Not Found',
    statusCode: 404,
  }),

  ICON_COLLECTION_NOT_FOUND: (name: string) => createError({
    name: 'E_ICON_COLLECTION_NOT_FOUND',
    message: `Icon collection "${name}" not found`,
    statusText: 'Not Found',
    statusCode: 404,
  }),

  ICON_COLLECTION_ALREADY_EXISTS: (name: string) => createError({
    name: 'E_ICON_COLLECTION_ALREADY_EXISTS',
    message: `Icon collection "${name}" already exists`,
    statusText: 'Conflict',
    statusCode: 409,
  }),

  ICONIFY_FETCH_FAILED: (response: Response) => createError({
    name: 'E_ICONIFY_FETCH_FAILED',
    message: response.statusText,
    statusText: response.statusText,
    statusCode: response.status,
  }),

  ICONIFY_IMPORT_FAILED: (response: Response) => createError({
    name: 'E_ICONIFY_IMPORT_FAILED',
    message: response.statusText,
    statusText: response.statusText,
    statusCode: response.status,
  }),
}
