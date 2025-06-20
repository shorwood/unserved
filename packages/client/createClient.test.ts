// import { createHttpRoute, ModuleBase } from '@unserved/server'
import { Client } from '@unshared/client'
import { createClient } from './createClient'

describe('createClient', () => {
  describe('it should return an instance of Client', () => {
    it('with the correct methods', () => {
      const client = createClient()
      expect(client).toBeInstanceOf(Client)
    })
  })
})
