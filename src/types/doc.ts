export type DocId = string

export interface DocEntity {
  id: DocId
  title: string
  content: string
  createdAt: number
  updatedAt: number
  lastVisitedAt: number
}
