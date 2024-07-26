export const PERMISSIONS = {

  // Form
  FORM_READ: {
    id: 'form.read',
    name: 'Form - Read',
    description: 'Read the form data, including the title, description, and fields.',
  },
  FORM_SEARCH: {
    id: 'form.search',
    name: 'Form - Search',
    description: 'Search for a form using the title, description, or fields.',
  },
  FORM_CREATE: {
    id: 'form.create',
    name: 'Form - Create',
    description: 'Create a new form in the form list.',
  },
  FORM_UPDATE: {
    id: 'form.update',
    name: 'Form - Update',
    description: 'Update the form data, including the title, description, and fields.',
  },
  FORM_DELETE: {
    id: 'form.delete',
    name: 'Form - Delete',
    description: 'Delete the form from the form list.',
  },

  // Submission
  SUBMISSION_READ: {
    id: 'form.submission.read',
    name: 'Form Submission - Read',
    description: 'Read the submission data, including the form, fields, and status.',
  },
  SUBMISSION_SEARCH: {
    id: 'form.submission.search',
    name: 'Form Submission - Search',
    description: 'Search for a submission using the form, fields, or status.',
  },
  SUBMISSION_DELETE: {
    id: 'form.submission.delete',
    name: 'Form Submission - Delete',
    description: 'Delete the submission from the submission list.',
  },
}
