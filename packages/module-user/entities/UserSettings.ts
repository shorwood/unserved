import { Column, Entity } from 'typeorm'
import { Metadata } from '@unserve/server'

/**
 * The user settings represent the global settings of the user module such as if user
 * registration is enabled, what is the minimum password length, are TOTP codes required,
 * etc.
 */
@Entity({ name: 'UserSettings' })
export class UserSettings extends Metadata {

  /**
   * The user registration status. It determines if the user registration is enabled.
   *
   * @example false
   */
  @Column('boolean', { default: false })
    isRegistrationEnabled: boolean

  /**
   * The minimum password length. It determines the minimum length of the user password.
   * The user password must be at least this length.
   *
   * @example 8
   */
  @Column('int', { default: 8 })
    minimumPasswordLength: number

  /**
   * The TOTP code requirement status. It determines if the TOTP codes are required for
   * the user login.
   *
   * @example false
   */
  @Column('boolean', { default: false })
    isTOTPRequired: boolean
}
