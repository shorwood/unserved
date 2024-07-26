import { Column, Entity, ManyToOne, OneToMany, Unique } from 'typeorm'
import { join } from 'node:path'
import { UUID } from 'node:crypto'
import { Metadata } from '@unserve/server'
import { StorageFolderOwner, StorageFolderOwnerObject } from './StorageFolderOwner'
import { StorageFile, StorageFileObject } from './StorageFile'

/** Serialize options for the `StorageFolder` entity. */
interface SerializeOptions {
  withChildren?: boolean
  withParents?: boolean
}

/** Serialzed representation of the `StorageFolder` entity. */
export interface StorageFolderObject {
  id: UUID
  url: undefined
  name: string
  path: string
  size: number
  type: string
  description: string
  updatedAt: string
  createdAt: string
  owners?: StorageFolderOwnerObject[]
  children?: Array<StorageFileObject | StorageFolderObject>
  hierarchy?: StorageFolderObject[]
}

/**
 * An `StorageFolder` is a virtual entity that represents a folder in the asset database. It is
 * used to group assets together and provide a directory structure for the assets.
 */
@Entity({ name: 'StorageFolder' })
@Unique(['parent', 'name'])
export class StorageFolder extends Metadata {

  /**
   * The computed absolute path of the folder as if it was in a filesystem. It is used to
   * determine the directory structure of the folder and create a unique constraint on the
   * folder.
   */
  @Column('varchar', { length: 255 })
    name: string

  /**
   * Description of the folder. It is a short text that describes the folder and its usage.
   * It may be used as the `alt` attribute of the folder in the HTML.
   *
   * @example 'A folder for storing images'
   */
  @Column('text', { default: '' })
    description: string

  /**
   * A flag that indicates whether the folder is the root folder of the asset database. It is
   * used to determine the directory structure of the folder and create a unique constraint on
   * the folder.
   */
  @Column('boolean', { unique: true, nullable: true })
    isRoot?: boolean

  /**
   * The parent folder of the folder. It is used to determine the directory structure of the
   * folder.
   */
  @ManyToOne(() => StorageFolder, folder => folder.children, { nullable: true })
    parent?: StorageFolder

  /**
   * The children folders of the folder. It is used to group multiple folders together and
   * provide a directory structure for the folders.
   */
  @OneToMany(() => StorageFolder, folder => folder.parent, { cascade: true })
    folders?: StorageFolder[]

  /**
   * The assets that are stored in the folder. It is used to regroup multiple assets together
   * and provide a directory structure for the assets.
   */
  @OneToMany(() => StorageFile, asset => asset.parent, { cascade: true })
    files?: StorageFile[]

  /**
   * A reference to the owner of the entity. It is used to determine who has the permission to
   * read, update, or delete the entity.
   */
  @OneToMany(() => StorageFolderOwner, owner => owner.folder)
    owners?: StorageFolderOwner[]

  /**
   * @returns The absolute path of the asset as if it was in a filesystem. It is used to
   * determine the directory structure of the asset.
   */
  get path(): string {
    return join(this.parent?.path ?? '/', this.name)
  }

  /**
   * @returns the total size of the folder and its children.
   *
   * @example 1024
   */
  get size(): number {
    let size = 0
    if (this.files) for (const file of this.files) size += file.size
    if (this.children) for (const folder of this.children) size += folder.size
    return size
  }

  /**
   * @returns The children and files of the folder at the specified depth.
   */
  get children(): Array<StorageFile | StorageFolder> | undefined {
    if (!this.folders && !this.files) return undefined
    const result: Array<StorageFile | StorageFolder> = []
    if (this.folders) result.push(...this.folders)
    if (this.files) result.push(...this.files)
    return result
  }

  /**
   * @returns An array containing all the parent folders of the folder.
   * Also includes the folder itself as the last element.
   */
  get hierarchy(): StorageFolder[] {
    if (!this.parent) return [this]

    // --- Build the hierarchy.
    const hierarchy: StorageFolder[] = []
    let next: StorageFolder | undefined = this.parent
    while (next) {
      hierarchy.unshift(next)
      next = next.parent
    }

    // --- Return the hierarchy.
    return [...hierarchy, this]
  }

  /**
   * @param options The options to use when serializing the entity.
   * @returns The plain object representation of the entity.
   */
  serialize(options: SerializeOptions = {}): StorageFolderObject {
    const children = options.withChildren ? this.children : undefined
    const hierarchy = options.withParents ? this.hierarchy : undefined
    return {
      id: this.id,
      url: undefined,
      name: this.name,
      path: this.path,
      size: this.size,
      type: 'inode/directory',
      description: this.description,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      owners: this.owners?.map(x => x.serialize()),
      children: children?.map(x => x.serialize({ withParents: false })),
      hierarchy: hierarchy?.map(x => x.serialize({ withParents: false })),
    }
  }
}
