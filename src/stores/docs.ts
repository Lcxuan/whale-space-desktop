import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { docStorage } from '../utils/docStorage'
import type { DocEntity, DocId } from '../types/doc'

export const useDocsStore = defineStore('docs', () => {
  const docs = ref<DocEntity[]>([])

  const sortedDocs = computed(() => {
    return [...docs.value].sort((a, b) => b.updatedAt - a.updatedAt)
  })

  const recentDocs = computed(() => sortedDocs.value.slice(0, 8))

  function load() {
    docs.value = docStorage.loadAll()
  }

  function create(title = '未命名文档') {
    const doc = docStorage.create({ title })
    docs.value = docStorage.loadAll()
    return doc
  }

  function rename(id: DocId, title: string) {
    docStorage.update(id, { title })
    docs.value = docStorage.loadAll()
  }

  function updateContent(id: DocId, content: string) {
    docStorage.update(id, { content })
    docs.value = docStorage.loadAll()
  }

  function remove(id: DocId) {
    docStorage.remove(id)
    docs.value = docStorage.loadAll()
  }

  function getById(id: DocId) {
    return docs.value.find((d) => d.id === id) ?? null
  }

  return {
    docs,
    sortedDocs,
    recentDocs,
    load,
    create,
    rename,
    updateContent,
    remove,
    getById
  }
})

