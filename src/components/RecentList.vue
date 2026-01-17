<!-- 组件：最近文档列表 -->
<template>
  <el-empty v-if="items.length === 0" description="暂无记录" />
  <el-table v-else :data="items" size="large" height="100%" style="width: 100%" @row-click="onOpen">
    <el-table-column prop="title" label="标题" />
    <el-table-column label="创建时间" width="160">
      <template #default="{ row }">
        <el-text type="info">{{ formatTime(row.createdAt) }}</el-text>
      </template>
    </el-table-column>
    <el-table-column label="最近访问" width="160">
      <template #default="{ row }">
        <el-text type="info">{{ formatTime(row.lastVisitedAt) }}</el-text>
      </template>
    </el-table-column>
    <el-table-column label="更新时间" width="160">
      <template #default="{ row }">
        <el-text type="info">{{ formatTime(row.updatedAt) }}</el-text>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDocsStore } from '../stores/docs'
import { formatTime } from '../utils/time'
import type { DocEntity } from '../types/doc'

const router = useRouter()
const docsStore = useDocsStore()

onMounted(() => {
  // 进入页面时加载文档列表
  docsStore.load()
})

const items = computed(() => docsStore.recentDocs)

function onOpen(row: DocEntity) {
  // 打开前先记录一次“最近访问”，保证列表与时间戳及时刷新
  docsStore.touchVisit(row.id)
  router.push(`/editor/${row.id}`)
}
</script>

<style scoped>
:deep(.el-table) {
  height: 100%;
  font-size: 14px;
}

:deep(.el-table__header-wrapper .el-table__cell) {
  font-size: 14px;
  padding-top: 14px;
  padding-bottom: 14px;
}

:deep(.el-table__body-wrapper .el-table__cell) {
  padding-top: 16px;
  padding-bottom: 16px;
}

:deep(.el-table__body-wrapper .el-text) {
  font-size: 14px;
}
</style>
