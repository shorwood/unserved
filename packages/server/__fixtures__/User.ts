import { Column, Entity } from 'typeorm'
import { BaseEntity } from '../BaseEntity'

@Entity()
export class User extends BaseEntity {

  @Column('varchar')
  firstName: string

  @Column('varchar')
  lastName: string

  @Column('varchar', { unique: true })
  email: string
}
