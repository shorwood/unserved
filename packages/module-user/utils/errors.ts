import { createError } from 'h3'

export const ERRORS = {

  // Users
  USER_NOT_FOUND: (id: string) => createError({
    name: 'E_USER_NOT_FOUND',
    statusCode: 404,
    statusText: 'Not Found',
    message: `The user with ID "${id}" was not found`,
  }),
  USER_PASSWORD_MISMATCH: () => createError({
    name: 'E_USER_PASSWORD_MISMATCH',
    statusCode: 400,
    statusText: 'Bad Request',
    message: 'The password and password confirm do not match',
  }),

  // Sessions
  USER_SESSION_NOT_FOUND: () => createError({
    name: 'E_USER_SESSION_NOT_FOUND',
    statusCode: 401,
    statusText: 'Unauthorized',
    message: 'User session was not found',
  }),
  USER_SESSION_EXPIRED: () => createError({
    name: 'E_USER_SESSION_EXPIRED',
    statusCode: 401,
    statusText: 'Unauthorized',
    message: 'The user session has expired',
  }),
  USER_SESSION_USER_NOT_FOUND: () => createError({
    name: 'E_USER_SESSION_USER_NOT_FOUND',
    statusCode: 401,
    statusText: 'Unauthorized',
    message: 'The user session is associated with a non-existing user',
  }),
  USER_SESSION_MISSING_HEADER: () => createError({
    name: 'E_USER_SESSION_MISSING_HEADER',
    statusCode: 401,
    statusText: 'Unauthorized',
    message: 'The user session is missing the required header',
  }),

  // Auth
  USER_BAD_CREDENTIALS: () => createError({
    name: 'E_USER_BAD_CREDENTIALS',
    statusCode: 401,
    statusText: 'Unauthorized',
    message: 'The username or password is incorrect',
  }),
  USER_NOT_ALLOWED: () => createError({
    name: 'E_USER_NOT_ALLOWED',
    statusCode: 403,
    statusText: 'Forbidden',
    message: 'The user is not allowed to perform this operation',
  }),
  USER_EMAIL_TAKEN: () => createError({
    name: 'E_USER_EMAIL_TAKEN',
    statusCode: 409,
    statusText: 'Conflict',
    message: 'The email is already taken',
  }),

  // Roles
  USER_ROLE_NOT_FOUND: (id: string) => createError({
    name: 'E_USER_ROLE_NOT_FOUND',
    statusCode: 404,
    statusText: 'Not Found',
    message: `The role with ID "${id}" was not found`,
  }),
}
