import { createError } from 'h3'

export const ERRORS = {
  AI_OPENAI_KEY_NOT_SET: () => createError({
    name: 'E_AI_OPENAI_KEY_NOT_SET',
    message: 'OpenAI API key not set',
    statusCode: 400,
  }),

  AI_OPENAI_URL_NOT_SET: () => createError({
    name: 'E_AI_OPENAI_URL_NOT_SET',
    message: 'OpenAI API URL not set',
    statusCode: 400,
  }),

  AI_GENERATE_DESCRIPTION_FILE_NOT_IMAGE: (id: string) => createError({
    name: 'E_AI_GENERATE_DESCRIPTION_FILE_NOT_IMAGE',
    message: `The file with ID "${id}" is not an image`,
    statusCode: 400,
  }),

  AI_OPENAI_ERROR: async(response: Response) => {
    const json = await response.json() as { error: { message: string } }
    const message = json?.error?.message ?? response.statusText
    return createError({
      name: 'E_AI_OPENAI_ERROR',
      message: `Failed to complete OpenAI request: ${message}`,
      statusMessage: response.statusText,
      statusCode: response.status,
    })
  },
}
