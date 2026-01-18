export type DocFolderId = string

export interface DocFolderEntity {
  id: DocFolderId
  name: string
  parentId: DocFolderId | null
  createdAt: number
  updatedAt: number
}
