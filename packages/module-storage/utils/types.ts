import type { Readable } from 'node:stream'
import type { RemoveOptions } from 'typeorm'

export interface StorageDownloadOptions {

  /**
   * The number of bytes to skip before starting the download. If the offset
   * is not provided, the download starts from the beginning of the file.
   */
  offset?: number

  /**
   * The number of bytes to download from the remote storage. If the size is
   * not provided, the entire file is downloaded.
   */
  size?: number

  /**
   * The `AbortSignal` to use for the download operation. If the signal is
   * aborted, the download operation is cancelled and the stream is closed.
   */
  abortSignal?: AbortSignal
}

export interface StorageDownloadResult {
  url?: () => Promise<string>
  text: () => Promise<string>
  data: () => Promise<Buffer>
  base64url: () => Promise<string>
  stream: () => Readable
  type: string
  size: number
}

export interface StorageEraseOptions extends RemoveOptions {

  /**
   * If `true`, delete the asset even if it is referenced more than once.
   * Be careful when using this option as it can lead to data loss if the
   * same S3 object is used by multiple entities.
   *
   * @default false
   */
  force?: boolean
}

export interface StoragePurgeResult {
  size: number
  count: number
}

export interface StorageUploadOptions {

  /**
   * The `AbortSignal` to use for the upload operation. If the signal is
   * aborted, the upload operation is cancelled and the stream is closed.
   */
  abortSignal?: AbortSignal
}
