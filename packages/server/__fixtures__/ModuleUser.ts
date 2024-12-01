import { createHttpRoute } from '../createHttpRoute'
import { ModuleBase } from '../createModule'
import { User } from './User'

export class ModuleUser extends ModuleBase {
  entities = { User }
  routes = {
    getUser: () => createHttpRoute({
      name: 'GET /api/users/:id',
      parseQuery: ({ id }) => ({ id: Number(id) }),
    }, ({ query }) => ({
      id: Number(query.id),
      name: 'John Doe',
    })),
  }
}
