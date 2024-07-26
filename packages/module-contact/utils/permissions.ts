export const PERMISSIONS = {

  // Person
  PERSON_READ: {
    id: 'contact.read.person',
    name: 'Contact - Read Person',
    description: 'Read the person data, including the name, email, and phone number.',
  },
  PERSON_SEARCH: {
    id: 'contact.search.person',
    name: 'Contact - Search Person',
    description: 'Search for a person using the name, email, or phone number.',
  },
  PERSON_CREATE: {
    id: 'contact.create.person',
    name: 'Contact - Create Person',
    description: 'Create a new person in the contact list.',
  },
  PERSON_UPDATE: {
    id: 'contact.update.person',
    name: 'Contact - Update Person',
    description: 'Update the person data, including the name, email, and phone number.',
  },
  PERSON_DELETE: {
    id: 'contact.delete.person',
    name: 'Contact - Delete Person',
    description: 'Delete the person from the contact list.',
  },

  // Organization
  ORGANIZATION_READ: {
    id: 'contact.read.organization',
    name: 'Contact - Read Organization',
    description: 'Read the organization data, including the name and associated persons.',
  },
  ORGANIZATION_SEARCH: {
    id: 'contact.search.organization',
    name: 'Contact - Search Organization',
    description: 'Search for an organization using the name or associated persons.',
  },
  ORGANIZATION_CREATE: {
    id: 'contact.create.organization',
    name: 'Contact - Create Organization',
    description: 'Create a new organization in the contact list.',
  },
  ORGANIZATION_UPDATE: {
    id: 'contact.update.organization',
    name: 'Contact - Update Organization',
    description: 'Update the organization data, including the name and associated persons.',
  },
  ORGANIZATION_DELETE: {
    id: 'contact.delete.organization',
    name: 'Contact - Delete Organization',
    description: 'Delete the organization from the contact list.',
  },
}
