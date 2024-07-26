export const PERMISSIONS = {

  // User
  USER_READ: {
    id: 'user.read',
    name: 'User - Read',
    description: 'Read user data and profile.',
  },
  USER_SEARCH: {
    id: 'user.search',
    name: 'User - Search',
    description: 'Search for users.',
  },
  USER_CREATE: {
    id: 'user.create',
    name: 'User - Create',
    description: 'Create a new user.',
  },
  USER_UPDATE: {
    id: 'user.update',
    name: 'User - Update',
    description: 'Update user data and profile.',
  },
  USER_DELETE: {
    id: 'user.delete',
    name: 'User - Delete',
    description: 'Delete a user.',
  },

  // Role
  ROLE_READ: {
    id: 'user.read.role',
    name: 'User Role - Read',
    description: 'Read the role data, including the name and permissions.',
  },
  ROLE_SEARCH: {
    id: 'user.search.role',
    name: 'User Role - Search',
    description: 'Search for a role using the name or permissions.',
  },
  ROLE_CREATE: {
    id: 'user.create.role',
    name: 'User Role - Create',
    description: 'Create a new role.',
  },
  ROLE_UPDATE: {
    id: 'user.update.role',
    name: 'User Role - Update',
    description: 'Update the role data, including the name and permissions.',
  },
  ROLE_DELETE: {
    id: 'user.delete.role',
    name: 'User Role - Delete',
    description: 'Delete the role.',
  },

  // Password
  PASSWORD_RESET: {
    id: 'user.password.reset',
    name: 'User - Password Reset',
    description: 'Reset user password.',
  },
  PASSWORD_UPDATE: {
    id: 'user.password.update',
    name: 'User - Password Update',
    description: 'Update user password.',
  },
}
