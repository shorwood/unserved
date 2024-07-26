/* eslint-disable n/no-unsupported-features/node-builtins */
import { FileLike } from '../utils'
import { ModuleStorage } from '../index'
import { StorageFile } from '../entities'

/**
 * Import data to the S3-Compatible bucket from a remote URL.
 *
 * @param this The `ModuleStorage` instance to use to import the asset.
 * @param url The URL of the data to import to the bucket.
 * @param file Override the `FileLike` object with the provided data.
 * @returns The `Asset` entity of the imported data.
 */
export async function uploadFromUrl(this: ModuleStorage, url: URL | string, file: Partial<FileLike> = {}): Promise<StorageFile> {

  // --- Download the data from the remote URL.
  const data = await fetch(url)
  if (!data.ok || !data.body) throw new Error('Could not import the asset from the URL')

  // --- Get the type and size of the data from the headers.
  const type = data.headers.get('Content-Type')
  const size = data.headers.get('Content-Length')
  if (!type || !size) throw new Error('Could not import the asset from the URL')

  // --- Pass the stream to the `upload` method and return the asset.
  return await this.upload({
    stream: () => data.body as ReadableStream,
    name: new URL(data.url).pathname,
    source: url.toString(),
    size: Number(size),
    type,
    ...file,
  })
}
