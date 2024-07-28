import { ModuleBase } from '@unserved/server'

export class ModuleEmail extends ModuleBase {

  /**
   * The SMTP server host. This is the server that will send the email. If
   * not defined, this will default to `process.env.EMAIL_HOST`.
   *
   * @example 'smtp.gmail.com'
   * @default process.env.EMAIL_HOST
   */
  emailHost: string
}
