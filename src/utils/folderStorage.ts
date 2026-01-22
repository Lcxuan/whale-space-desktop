import type { DocFolderEntity, DocFolderId } from '../types/docFolder'
import { storage } from './storage'
import { createId } from './id'

const FOLDERS_KEY = 'whale_space_doc_folders'

const normalizeFolders = (input: unknown): DocFolderEntity[] => {
  if (!Array.isArray(input)) return []
  return input
    .map((item): DocFolderEntity | null => {
      if (!item || typeof item !== 'object') return null
      const obj = item as Partial<DocFolderEntity>
      if (!obj.id || !obj.name) return null
      const createdAt = typeof obj.createdAt === 'number' ? obj.createdAt : Date.now()
      const updatedAt = typeof obj.updatedAt === 'number' ? obj.updatedAt : Date.now()
      return {
        id: String(obj.id),
        name: String(obj.name),
        parentId: typeof obj.parentId === 'string' ? obj.parentId : null,
        createdAt,
        updatedAt
      }
    })
    .filter((x): x is DocFolderEntity => x !== null)
}

export const folderStorage = {
  loadAll: (): DocFolderEntity[] => {
    const raw = storage.get<unknown>(FOLDERS_KEY)
    return normalizeFolders(raw)
  },
  saveAll: (next: DocFolderEntity[]) => {
    storage.set(FOLDERS_KEY, next)
  },
  create: (input: { name: string; parentId?: DocFolderId | null }): DocFolderEntity => {
    const now = Date.now()
    const folder: DocFolderEntity = {
      id: createId('folder'),
      name: input.name,
      parentId: input.parentId ?? null,
      createdAt: now,
      updatedAt: now
    }
    const folders = folderStorage.loadAll()
    folders.unshift(folder)
    folderStorage.saveAll(folders)
    return folder
  },
  rename: (id: DocFolderId, name: string) => {
    const folders = folderStorage.loadAll()
    const idx = folders.findIndex((f) => f.id === id)
    if (idx < 0) return
    folders[idx] = {
      ...folders[idx],
      name,
      updatedAt: Date.now()
    }
    folderStorage.saveAll(folders)
  },
  remove: (id: DocFolderId) => {
    const folders = folderStorage.loadAll().filter((f) => f.id !== id)
    folderStorage.saveAll(folders)
  }
}
