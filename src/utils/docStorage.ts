import type { DocEntity, DocId } from '../types/doc'
import { storage } from './storage'
import { createId } from './id'

const DOCS_KEY = 'whale_space_docs'

function normalizeDocs(input: unknown): DocEntity[] {
  if (!Array.isArray(input)) return []
  return input
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const obj = item as Partial<DocEntity>
      if (!obj.id || !obj.title) return null
      return {
        id: String(obj.id),
        title: String(obj.title),
        content: typeof obj.content === 'string' ? obj.content : '',
        createdAt: typeof obj.createdAt === 'number' ? obj.createdAt : Date.now(),
        updatedAt: typeof obj.updatedAt === 'number' ? obj.updatedAt : Date.now()
      } satisfies DocEntity
    })
    .filter((x): x is DocEntity => Boolean(x))
}

export const docStorage = {
  loadAll(): DocEntity[] {
    const raw = storage.get<unknown>(DOCS_KEY)
    return normalizeDocs(raw)
  },

  saveAll(next: DocEntity[]) {
    storage.set(DOCS_KEY, next)
  },

  create(input: { title: string; content?: string }): DocEntity {
    const now = Date.now()
    const doc: DocEntity = {
      id: createId('doc'),
      title: input.title,
      content: input.content ?? '',
      createdAt: now,
      updatedAt: now
    }
    const docs = this.loadAll()
    docs.unshift(doc)
    this.saveAll(docs)
    return doc
  },

  update(id: DocId, patch: Partial<Pick<DocEntity, 'title' | 'content'>>) {
    const docs = this.loadAll()
    const idx = docs.findIndex((d) => d.id === id)
    if (idx < 0) return
    docs[idx] = {
      ...docs[idx],
      ...patch,
      updatedAt: Date.now()
    }
    this.saveAll(docs)
  },

  remove(id: DocId) {
    const docs = this.loadAll().filter((d) => d.id !== id)
    this.saveAll(docs)
  }
}

