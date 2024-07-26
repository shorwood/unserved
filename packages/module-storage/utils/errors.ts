import { createError } from 'h3'

export const ERRORS = {
  ASSET_MISSING_FILE_NAME: () => createError({
    name: 'E_ASSET_MISSING_FILE_NAME',
    statusCode: 400,
    statusText: 'Bad Request',
    message: 'Could not determine the file name',
  }),

  ASSET_MISSING_FILE_TYPE: () => createError({
    name: 'E_ASSET_MISSING_FILE_TYPE',
    statusCode: 400,
    statusText: 'Bad Request',
    message: 'Could not determine the file type',
  }),

  ASSET_MISSING_FILE_ID: () => createError({
    name: 'E_ASSET_MISSING_FILE_ID',
    statusCode: 400,
    statusText: 'Bad Request',
    message: 'Could not determine the file ID',
  }),

  ASSET_FILE_NOT_FOUND: (id: string) => createError({
    name: 'E_ASSET_FILE_NOT_FOUND',
    statusCode: 404,
    statusText: 'Not Found',
    message: `Could not find the requested asset with ID "${id}"`,
  }),

  ASSET_REMOTE_DOWNLOAD_FAILED: (url: string) => createError({
    name: 'E_ASSET_REMOTE_DOWNLOAD_FAILED',
    statusCode: 500,
    statusText: 'Internal Server Error',
    message: `Could not download the asset from the remote storage at "${url}"`,
  }),

  ASSET_FOLDER_NOT_FOUND: (id: string) => createError({
    name: 'E_ASSET_FOLDER_NOT_FOUND',
    statusCode: 404,
    statusText: 'Not Found',
    message: `Could not find the requested folder with ID "${id}"`,
  }),

  ASSET_FILE_OR_FOLDER_NOT_FOUND: (id: string) => createError({
    name: 'E_ASSET_FILE_OR_FOLDER_NOT_FOUND',
    statusCode: 404,
    statusText: 'Not Found',
    message: `Could not find the requested file or folder with ID "${id}"`,
  }),
}
