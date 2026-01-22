import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { docStorage } from '../utils/docStorage'
import { folderStorage } from '../utils/folderStorage'
import type { DocEntity, DocId } from '../types/doc'
import type { DocFolderEntity, DocFolderId } from '../types/docFolder'

export const useDocsStore = defineStore('docs', () => {
  const docs = ref<DocEntity[]>([])
  const folders = ref<DocFolderEntity[]>([])

  const sortedDocs = computed(() => {
    return [...docs.value].sort((a, b) => b.updatedAt - a.updatedAt)
  })

  const recentDocs = computed(() => {
    return [...docs.value].sort((a, b) => b.lastVisitedAt - a.lastVisitedAt).slice(0, 8)
  })

  const load = () => {
    docs.value = docStorage.loadAll()
    folders.value = folderStorage.loadAll()
  }

  const create = (title = '未命名文档', folderId: string | null = null) => {
    const doc = docStorage.create({ title, folderId })
    docs.value = docStorage.loadAll()
    return doc
  }

  const createFolder = (name = '未命名文件夹', parentId: DocFolderId | null = null) => {
    const folder = folderStorage.create({ name, parentId })
    folders.value = folderStorage.loadAll()
    return folder
  }

  const renameFolder = (id: DocFolderId, name: string) => {
    folderStorage.rename(id, name)
    folders.value = folderStorage.loadAll()
  }

  const removeFolder = (id: DocFolderId) => {
    folderStorage.remove(id)
    folders.value = folderStorage.loadAll()
  }

  const rename = (id: DocId, title: string) => {
    docStorage.update(id, { title })
    docs.value = docStorage.loadAll()
  }

  const updateContent = (id: DocId, content: string) => {
    docStorage.update(id, { content })
    docs.value = docStorage.loadAll()
  }

  const touchVisit = (id: DocId) => {
    docStorage.touch(id)
    docs.value = docStorage.loadAll()
  }

  const remove = (id: DocId) => {
    docStorage.remove(id)
    docs.value = docStorage.loadAll()
  }

  const getById = (id: DocId) => {
    return docs.value.find((d) => d.id === id) ?? null
  }

  return {
    docs,
    folders,
    sortedDocs,
    recentDocs,
    load,
    create,
    createFolder,
    renameFolder,
    removeFolder,
    rename,
    updateContent,
    touchVisit,
    remove,
    getById
  }
})
