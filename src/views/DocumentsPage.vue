<template>
  <el-card>
    <template #header>
      <div class="ws-header">
        <div class="ws-header__left">
          <el-input v-model="keyword" placeholder="搜索标题" clearable style="width: 280px" />
        </div>
        <div class="ws-header__right">
          <el-button type="primary" @click="createDoc">新建文档</el-button>
        </div>
      </div>
    </template>

    <el-empty v-if="filtered.length === 0" description="暂无文档" />

    <el-table v-else :data="filtered" style="width: 100%" @row-click="onOpen">
      <el-table-column label="标题" min-width="240">
        <template #default="{ row }">
          <el-text>{{ row.title }}</el-text>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" width="180">
        <template #default="{ row }">
          <el-text type="info">{{ formatTime(row.updatedAt) }}</el-text>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180">
        <template #default="{ row }">
          <el-space>
            <el-button size="small" @click.stop="onRename(row)">重命名</el-button>
            <el-button size="small" type="danger" @click.stop="onDelete(row)">删除</el-button>
          </el-space>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { useDocsStore } from '../stores/docs'
import { formatTime } from '../utils/time'
import type { DocEntity } from '../types/doc'

const docsStore = useDocsStore()
const router = useRouter()

const keyword = ref('')

onMounted(() => {
  docsStore.load()
})

const filtered = computed(() => {
  const kw = keyword.value.trim()
  if (!kw) return docsStore.sortedDocs
  return docsStore.sortedDocs.filter((d) => d.title.includes(kw))
})

function createDoc() {
  const doc = docsStore.create()
  router.push(`/editor/${doc.id}`)
}

function onOpen(row: DocEntity) {
  router.push(`/editor/${row.id}`)
}

async function onRename(row: DocEntity) {
  const { value } = await ElMessageBox.prompt('请输入新标题', '重命名', {
    inputValue: row.title,
    confirmButtonText: '保存',
    cancelButtonText: '取消'
  }).catch(() => ({ value: null as unknown as string }))
  if (!value) return
  docsStore.rename(row.id, value)
  ElMessage.success('已保存')
}

async function onDelete(row: DocEntity) {
  const ok = await ElMessageBox.confirm(`确认删除「${row.title}」？`, '删除文档', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => true)
    .catch(() => false)
  if (!ok) return
  docsStore.remove(row.id)
  ElMessage.success('已删除')
}
</script>

<style scoped>
.ws-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>

