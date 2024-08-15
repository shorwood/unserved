import { Metadata } from '@unserved/server'
import { Column, Entity } from 'typeorm'

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
   * @example 1
   */
  @Column('int', { default: 1 })
  minimumPasswordLength: number

  /**
   * The minimum password complexity. As computed by the zxcvbn algorithm, it represents
   * the entropy based on the number of unique characters, the length of the password and
   * the number of guesses required to crack the password.
   *
   * @example 0
   */
  @Column('int', { default: 0 })
  minimumPasswordComplexity: number

  /**
   * The TOTP code requirement status. It determines if the TOTP codes are required for
   * the user login.
   *
   * @example false
   */
  @Column('boolean', { default: false })
  isTotpRequired: boolean
}
