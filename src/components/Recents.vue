<template>
  <div v-if="isEditor" class="ws-titlebar-context">
    <div class="ws-titlebar-context__left">
      <el-breadcrumb separator=">">
        <el-breadcrumb-item :to="{ path: '/' }">我的文档库</el-breadcrumb-item>
        <el-breadcrumb-item v-for="seg in folderSegments" :key="seg.id">{{ seg.name }}</el-breadcrumb-item>
        <el-breadcrumb-item>{{ docTitle }}</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="ws-titlebar-context__right">最近修改：{{ updatedDateCN }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useDocsStore } from '../stores/docs'

const route = useRoute()
const docsStore = useDocsStore()

const isEditor = computed(() => route.name === 'editor')
const docId = computed(() => String((route.params as any)?.id ?? ''))

const doc = computed(() => {
  if (!isEditor.value) return null
  const id = docId.value
  if (!id) return null
  return docsStore.getById(id)
})

const docTitle = computed(() => doc.value?.title?.trim() || '未命名文档')

const folderSegments = computed(() => {
  const list: { id: string; name: string }[] = []
  const folderId = doc.value?.folderId ?? null
  if (!folderId) return list

  const seen = new Set<string>()
  let cur: string | null = folderId
  while (cur) {
    if (seen.has(cur)) break
    seen.add(cur)
    const folder = docsStore.folders.find((f) => f.id === cur)
    if (!folder) break
    list.unshift({ id: folder.id, name: folder.name })
    cur = folder.parentId
  }
  return list
})

function formatDateCN(ms: number) {
  const d = new Date(ms)
  if (!Number.isFinite(d.getTime())) return ''
  const yyyy = d.getFullYear()
  const m = d.getMonth() + 1
  const day = d.getDate()
  return `${yyyy}年${m}月${day}日`
}

const updatedDateCN = computed(() => {
  const ms = doc.value?.updatedAt
  if (!ms) return ''
  return formatDateCN(ms)
})
</script>

<style scoped lang="scss">
.ws-titlebar-context {
  width: 100%;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 16px;
  box-sizing: border-box;
}

.ws-titlebar-context__left {
  min-width: 0;
  flex: 1;
}

.ws-titlebar-context__right {
  flex-shrink: 0;
  font-size: 13px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
}

.ws-titlebar-context :deep(.el-breadcrumb) {
  font-size: 13px;
}

.ws-titlebar-context :deep(.el-breadcrumb__inner) {
  color: var(--el-text-color-regular);
}

.ws-titlebar-context :deep(.el-breadcrumb__inner a) {
  color: var(--el-text-color-regular);
}

.ws-titlebar-context :deep(.el-breadcrumb__inner a:hover) {
  color: var(--el-color-primary);
}
</style>
