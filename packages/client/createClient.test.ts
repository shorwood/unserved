// import { createHttpRoute, ModuleBase } from '@unserved/server'
import { Client } from '@unshared/client'
import { createClient } from './createClient'

describe('createClient', () => {
  // class ModuleUser extends ModuleBase {
  //   routes = {
  //     get: createHttpRoute({
  //       name: 'PUT /user/:id',
  //       parseBody: () => ({} as { name: string }),
  //       parseParameters: () => ({} as { id: string }),
  //       parseQuery: () => ({} as { q: string }),
  //     }, () => ({ id: '1', name: 'John Doe' })),
  //   }
  // }

  describe('it should return an instance of Client', () => {
    it('with the correct methods', () => {
      const client = createClient()
      expect(client).toBeInstanceOf(Client)
    })
  })
})
