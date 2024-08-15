/* eslint-disable n/no-unsupported-features/node-builtins */
import type { Derive } from '@unshared/binary'
import type { Awaitable } from '@unshared/functions'
import type { MaybeFunction, MaybePromise } from '@unshared/types'
import type { Hash, UUID } from 'node:crypto'
import { deriveStreamHash } from '@unshared/binary'
import { Readable } from 'node:stream'
import { ReadableStream as NodeReadableStream } from 'node:stream/web'

export interface FileLike {
  stream: MaybeFunction<MaybePromise<Buffer | NodeReadableStream | Readable | ReadableStream | string>>
  name: string
  type: string
  size: number
  source?: string
  parentId?: UUID
  description?: string
}

export interface FileToStreamResult {
  stream: Readable
  hash: Awaitable<Derive<unknown>, Hash>
}

/**
 * Transform a `FileLike` object into a stream and derive the hash of the data.
 *
 * @param data The `FileLike` object to transform into a stream.
 * @returns A promise that resolves to the stream and hash of the data.
 */
export async function fileToStream(data: FileLike | FileLike['stream']): Promise<FileToStreamResult> {
  const hash = deriveStreamHash('sha256')

  // --- Extract the data from the `FileLike` object.
  if (data instanceof File) data = data.stream()
  if (typeof data === 'object' && 'stream' in data) data = data.stream

  // --- Call function and resolve promises.
  if (typeof data === 'function') data = data()
  if (data instanceof Promise) data = await data

  if (typeof data === 'string') data = Buffer.from(data)
  if (data instanceof Buffer) data = Readable.from(data)
  else if (data instanceof NodeReadableStream) data = Readable.fromWeb(data)
  else if (data instanceof ReadableStream) data = Readable.fromWeb(data as NodeReadableStream)
  else data = Readable.from(data)

  // --- Pipe the data to the hash stream and return the stream and hash.
  const stream = data.pipe(hash)
  return { stream, hash }
}
