export const PERMISSIONS = {
  PURGE: {
    id: 'storage.purge',
    name: 'Storage - Purge',
    description: 'Allow the deletion of all stale files from the remote storage',
  },
  DELETE: {
    id: 'storage.delete',
    name: 'Storage - Delete',
    description: 'Allow the deletion of a file or folder in storage',
  },
  UPDATE: {
    id: 'storage.update',
    name: 'Storage - Update',
    description: 'Allow the update of the metadata of a file or folder in storage',
  },

  // Folders
  FOLDER_READ: {
    id: 'storage.folder.get',
    name: 'Storage - Read Folder',
    description: 'Allow access to the metadata and children of a folder in storage',
  },
  FOLDER_CREATE: {
    id: 'storage.folder.create',
    name: 'Storage - Create Folder',
    description: 'Allow the creation of a folder in storage',
  },

  // Files
  // FILE_DOWNLOAD: {
  //   id: 'storage.file.download',
  //   name: 'Storage - Download',
  //   description: 'Allow access to all files in storage',
  // },
  // FILE_READ: {
  //   id: 'storage.file.read',
  //   name: 'Storage - Read',
  //   description: 'Allow access to the metadata of a file in storage',
  // },
  FILE_UPLOAD: {
    id: 'storage.file.upload',
    name: 'Storage - Upload',
    description: 'Allow the upload of a file to storage',
  },
}
