import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm'
import { Metadata } from '@unserve/server'
import { User, UserObject } from '@unserve/module-user'
import { StorageFile } from './StorageFile'

/** Serialzed representation of the `StorageFolderOwner` entity. */
export interface StorageFileOwnerObject {
  owner: UserObject
  permission: 'EDIT' | 'OWNER' | 'READ'
}

/**
 * A mapping of an `StorageFile` entity to a `User` entity. It
 * allows us to determine the ownership and permissions of the file.
 */
@Entity({ name: 'StorageFileOwner' })
@Unique(['file', 'owner'])
export class StorageFileOwner extends Metadata {

  /**
   * The `User` entity that owns the entity.
   */
  @JoinColumn()
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
    owner: User

  /**
   * The `StorageFile` entity that is owned by the user.
   */
  @JoinColumn()
  @ManyToOne(() => StorageFile, file => file.owners, { onDelete: 'CASCADE' })
    file: StorageFile

  /**
   * The permission level of the user on the file. If the user has the `OWNER` permission, they
   * can read, update, and delete the file.
   */
  @Column('varchar', { length: 255 })
    permission: 'EDIT' | 'OWNER' | 'READ'

  /**
   * @returns The plain object representation of the entity.
   */
  serialize(): StorageFileOwnerObject {
    return {
      owner: this.owner.serialize(),
      permission: this.permission,
    }
  }
}
