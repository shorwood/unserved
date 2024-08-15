import { User, UserObject } from '@unserved/module-user'
import { Metadata } from '@unserved/server'
import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm'
import { StorageFolder } from './StorageFolder'

/** Serialzed representation of the `StorageFolderOwner` entity. */
export interface StorageFolderOwnerObject {
  owner: UserObject
  permission: 'EDIT' | 'OWNER' | 'READ'
}

/**
 * A mapping of an `StorageFolder` entity to a `User` entity. It
 * allows us to determine the ownership and permissions of the folder.
 */
@Entity({ name: 'StorageFolderOwnership' })
@Unique(['folder', 'owner'])
export class StorageFolderOwner extends Metadata {

  /**
   * The `User` entity that owns the entity.
   */
  @JoinColumn()
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  owner: User

  /**
   * The `StorageFolder` entity that is owned by the user.
   */
  @JoinColumn()
  @ManyToOne(() => StorageFolder, folder => folder.owners, { onDelete: 'CASCADE' })
  folder: StorageFolder

  /**
   * The permission level of the user on the folder. It is used to determine the level of access
   * the user has on the folder. It is used to set the `Access-Control-Allow-Origin` header in the
   * HTTP response.
   */
  @Column('varchar', { length: 255 })
  permission: 'EDIT' | 'OWNER' | 'READ'

  /**
   * @returns The plain object representation of the entity.
   */
  serialize(): StorageFolderOwnerObject {
    return {
      owner: this.owner.serialize(),
      permission: this.permission,
    }
  }
}
