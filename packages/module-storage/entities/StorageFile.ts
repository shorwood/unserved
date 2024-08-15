import { Metadata, ModuleBase } from '@unserved/server'
import { UUID } from 'node:crypto'
import { join } from 'node:path'
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, Unique } from 'typeorm'
import { ModuleStorage } from '../index'
import { FileLike, StorageDownloadOptions, StorageDownloadResult, StorageEraseOptions } from '../utils'
import { StorageFileOwner } from './StorageFileOwner'
import { StorageFolder, StorageFolderObject } from './StorageFolder'
import { StorageFolderOwnerObject } from './StorageFolderOwner'

/** Serialize options for the `StorageFolder` entity. */
interface SerializeOptions {
  withParents?: boolean
}

/** Serialzed representation of the `StorageFile` entity. */
export interface StorageFileObject {
  id: UUID
  url: string
  path: string
  name: string
  type: string
  size: number
  description: string
  createdAt: string
  updatedAt: string
  owners?: StorageFolderOwnerObject[]
  hierarchy?: StorageFolderObject[]
}

/**
 * An asset is a digital file that can be used in the application. For example, an image,
 * a video, a document, etc. It is used to store the metadata and remote URL of the asset
 * in the database.
 */
@Entity({ name: 'StorageFile' })
@Unique(['parent', 'name'])
export class StorageFile extends Metadata {

  /**
   * The path of the asset as if it was in a filesystem. It is used to determine the
   * directory structure of the asset.
   *
   * @example '/images'
   */
  @Column('varchar', { length: 255 })
  name: string

  /**
   * The MD5 hash of the asset. It is used to determine the integrity of the asset. It is
   * used to set the `ETag` header in the HTTP response and compare it with the client's
   * `If-None-Match` header. It also helps avoid duplicate assets in the database.
   */
  @Column('varchar', { length: 255 })
  @Index({ unique: true })
  hash: string

  /**
   * The MIME type of the asset. It is used to determine the type of the asset such as
   * image, video, document, etc. It is used to set the `type` attribute of the asset in
   * the HTML.
   *
   * @example 'image/jpeg'
   * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types
   */
  @Column('varchar', { length: 255 })
  type: string

  /**
   * The size of the asset. It is used to determine the size of the asset in bytes. It is
   * used to set the `Content-Length` header in the HTTP response.
   *
   * @example 1024
   */
  @Column('int')
  size: number

  /**
   * If the file was uploaded from a remote URL, this field contains the URL of the remote
   * file. It is used to determine the source of the asset and the ability to download the
   * asset from the remote URL.
   */
  @Column('text', { default: '', nullable: true })
  source: string

  /**
   * Description of the asset. It is a short text that describes the asset and its usage.
   * It may be used as the `alt` attribute of the asset in the HTML.
   *
   * @example 'A banner image for the homepage'
   */
  @Column('text', { default: '', nullable: true })
  description: string

  /**
   * The number of times this object is referenced by other entities. It is used to determine
   * if the object is still in use and can be deleted. If the reference count is zero, the
   * object can be deleted.
   *
   * This allows us to store a single copy of the asset in the database and reference it from
   * multiple entities. For example, if the same profile picture is used by multiple users, we
   * can store the picture once and reference it from multiple users.
   */
  @Column('int', { default: 1 })
  references: number

  /**
   * The number of times this asset has been downloaded. It is used to determine the popularity
   * of the asset and the bandwidth usage of the server.
   */
  @Column('int', { default: 0 })
  downloads: number

  /**
   * A reference to the owner of the entity. It is used to determine who has the permission to
   * read, update, or delete the entity.
   */
  @OneToMany(() => StorageFileOwner, owner => owner.file)
  owners?: StorageFileOwner[]

  /**
   * A reference to the folder containing the asset. It is used to determine the directory
   * structure of the asset and it's path in the virtual filesystem.
   */
  @JoinColumn()
  @ManyToOne(() => StorageFolder, folder => folder.files)
  parent?: StorageFolder

  /**
   * @returns The URL to access the asset data. It points to the `/api/storage/:id` endpoint
   * that proxies the data from the S3-Compatible bucket or the local filesystem to the client.
   */
  get url() {
    return `/api/storage/${this.id}`
  }

  /**
   * @returns The absolute path of the asset as if it was in a filesystem. It is used to
   * determine the directory structure of the asset.
   */
  get path() {
    return join(this.parent?.path ?? '/', this.name)
  }

  /**
   * @returns An array containing all the parent folders of the file.
   */
  get hierarchy(): StorageFolder[] | undefined {
    if (!this.parent) return undefined

    // --- Build the hierarchy.
    const hierarchy: StorageFolder[] = []
    let next: StorageFolder | undefined = this.parent
    while (next) {
      hierarchy.unshift(next)
      next = next.parent
    }

    // --- Return the hierarchy.
    return hierarchy
  }

  /**
   * Upload data to the S3-Compatible bucket.
   *
   * @param module The `ModuleBase` instance to use to upload the asset.
   * @param file The data to upload to the bucket.
   * @returns The `Asset` entity of the uploaded data.
   */
  static async fromFile(module: ModuleBase, file: FileLike): Promise<StorageFile> {
    return module.getModule(ModuleStorage).upload(file)
  }

  /**
   * Import data to the S3-Compatible bucket from a remote URL.
   *
   * @param module The `ModuleBase` instance to use to upload the asset.
   * @param url The URL of the data to import to the bucket.
   * @param file Override the `FileLike` object with the provided data.
   * @returns The `Asset` entity of the imported data.
   */
  static async fromUrl(module: ModuleBase, url: string, file: Partial<FileLike> = {}): Promise<StorageFile> {
    return await module.getModule(ModuleStorage).uploadFromUrl(url, file)
  }

  /**
   * Download data from the S3-Compatible bucket.
   *
   * @param module The `ModuleBase` instance to use to download the asset.
   * @param options The options to use to download the asset.
   * @returns The data and metadata of the asset.
   */
  async download(module: ModuleBase, options?: StorageDownloadOptions): Promise<StorageDownloadResult> {
    return module.getModule(ModuleStorage).download(this, options)
  }

  /**
   * Download data from the S3-Compatible bucket and return the data as a `Buffer`.
   *
   * @param module The `ModuleBase` instance to use to download the asset.
   * @param options The options to use to download the asset.
   * @returns The data of the asset as a `Buffer`.
   */
  async data(module: ModuleBase, options?: StorageDownloadOptions): Promise<Buffer> {
    const { data } = await this.download(module, options)
    return data()
  }

  /**
   * Download data from the S3-Compatible bucket and return the data as a `string`.
   * The data is decoded using the provided `encoding` or `utf-8` by default.
   *
   * @param module The `ModuleBase` instance to use to download the asset.
   * @param options The options to use to download the asset.
   * @returns The data of the asset as a `string`.
   */
  async text(module: ModuleBase, options?: StorageDownloadOptions): Promise<string> {
    const { text } = await this.download(module, options)
    return text()
  }

  /**
   * Download data from the S3-Compatible bucket and return the data as a `JSON` object.
   * The data is parsed using the provided `reviver` or `undefined` by default.
   *
   * @param module The `ModuleBase` instance to use to download the asset.
   * @param options The options to use to download the asset.
   * @returns The data of the asset as a `JSON` object.
   */
  async base64url(module: ModuleBase, options?: StorageDownloadOptions): Promise<string> {
    const { base64url } = await this.download(module, options)
    return base64url()
  }

  /**
   * Get the URL of the asset. Base on the options, it either returns the local URL,
   * the remote URL, or the data as a `base64url`. By default, it returns the local URL.
   *
   * @param module The `ModuleBase` instance to use to download the asset.
   * @param from The source of the data to return.
   * @returns The URL of the asset.
   */
  async getUrl(module: ModuleBase, from?: 'base64' | 'remote'): Promise<string> {
    if (from === 'base64') return this.base64url(module)
    return this.url
  }

  /**
   * Remove the asset from the bucket AND the database. If the asset is referenced by other
   * entities, it will not be deleted unless the `force` flag is set to `true`.
   *
   * @param module The `ModuleBase` instance to use to upload the asset.
   * @param options The options to use to delete the asset.
   * @returns A promise that resolves when the asset is deleted.
   */
  async erase(module: ModuleBase, options?: StorageEraseOptions): Promise<void> {
    return module.getModule(ModuleStorage).erase(this, options)
  }

  /**
   * @param options The options to use when serializing the entity.
   * @returns The plain object representation of the entity.
   */
  serialize(options: SerializeOptions = {}): StorageFileObject {
    const hierarchy = options.withParents ? this.hierarchy : undefined
    return {
      id: this.id,
      url: this.url,
      path: this.path,
      name: this.name,
      type: this.type,
      size: this.size,
      description: this.description,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      owners: this.owners?.map(x => x.serialize()),
      hierarchy: hierarchy?.map(x => x.serialize({ withParents: false })),
    }
  }
}
