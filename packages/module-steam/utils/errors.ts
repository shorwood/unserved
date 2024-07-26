import { createError } from 'h3'

export const ERRORS = {
  STEAM_API_ERROR: (response: Response) => createError({
    name: 'E_STEAM_API_ERROR',
    message: `Failed to fetch the Steam API: ${response.statusText}`,
    statusMessage: response.statusText,
    statusCode: response.status,
  }),
}
