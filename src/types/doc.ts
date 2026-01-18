export type DocId = string

export interface DocEntity {
  id: DocId
  title: string
  content: string
  folderId?: string | null
  createdAt: number
  updatedAt: number
  lastVisitedAt: number
}
