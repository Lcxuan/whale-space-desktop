<!-- 文档编辑页 -->
<template>
  <div v-if="!doc" class="ws-empty">
    <el-empty description="文档不存在" />
  </div>

  <div v-else class="ws-doc">
    <div class="ws-doc__inner">
      <div class="ws-doc__header">
        <div class="ws-doc__title-wrap">
          <el-input v-model="title" class="ws-doc__title-input" placeholder="未命名文档" @change="onTitleCommit" />
        </div>

        <div class="ws-doc__meta">
          <el-avatar :size="22" class="ws-doc__avatar">
            {{ avatarText }}
          </el-avatar>
          <span class="ws-doc__author">{{ authorName }}</span>
          <span class="ws-doc__meta-sep">|</span>
          <span class="ws-doc__time">{{ updatedLabel }}</span>
        </div>
      </div>

      <div class="ws-doc__editor">
        <el-input
          v-model="content"
          type="textarea"
          :autosize="{ minRows: 18 }"
          class="ws-doc__content"
          placeholder="输入内容（支持基础 Markdown）"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useDocsStore } from '../stores/docs'
import { debounce } from '../utils/debounce'
import { formatTime } from '../utils/time'

const props = defineProps<{ id: string }>()

const docsStore = useDocsStore()

const title = ref('')
const content = ref('')

function syncFromStore() {
  // 从 store 回放到编辑器本地状态；切换文档/刷新后需要重新同步
  const d = docsStore.getById(props.id)
  if (!d) return
  // 打开编辑器即算一次访问
  docsStore.touchVisit(d.id)
  title.value = d.title
  content.value = d.content
}

onMounted(() => {
  docsStore.load()
  syncFromStore()
})

watch(
  () => props.id,
  () => {
    // 切换路由参数时重新加载并同步
    docsStore.load()
    syncFromStore()
  }
)

const doc = computed(() => docsStore.getById(props.id))

const authorName = computed(() => {
  const stored = localStorage.getItem('ws_user_name')
  return stored?.trim() || '我'
})

const avatarText = computed(() => {
  const t = authorName.value.trim()
  return t.slice(0, 1).toUpperCase()
})

const updatedLabel = computed(() => {
  if (!doc.value) return ''
  return `${formatTime(doc.value.updatedAt)} 修改`
})

// 内容保存采用防抖：连续输入时降低写入频率
const persist = debounce(() => {
  if (!doc.value) return
  docsStore.updateContent(doc.value.id, content.value)
}, 350)

watch(content, () => {
  if (!doc.value) return
  persist()
})

function onTitleCommit() {
  if (!doc.value) return
  // 标题提交时做 trim，并兜底未命名
  docsStore.rename(doc.value.id, title.value.trim() || '未命名文档')
}
</script>

<style scoped>
.ws-doc {
  height: 100%;
  min-height: 0;
  overflow: auto;
  background: var(--el-bg-color);
}

.ws-doc__inner {
  max-width: 860px;
  margin: 0 auto;
  padding: 24px 28px 80px;
}

.ws-doc__header {
  margin-bottom: 22px;
}

.ws-doc__title {
  margin: 0;
  text-align: left;
  font-size: 34px;
  line-height: 1.25;
  font-weight: 700;
  color: var(--el-text-color-primary);
}

.ws-doc__title-wrap {
  display: flex;
  justify-content: flex-start;
}

:deep(.ws-doc__title-input) {
  width: 100%;
}

:deep(.ws-doc__title-input .el-input__wrapper) {
  box-shadow: none;
  background: transparent;
  padding: 0;
}

:deep(.ws-doc__title-input .el-input__inner) {
  border: none;
  background: transparent;
  text-align: left;
  font-size: 34px;
  line-height: 1.25;
  font-weight: 700;
  color: var(--el-text-color-primary);
}

.ws-doc__meta {
  margin-top: 14px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.ws-doc__avatar {
  background: rgba(168, 85, 247, 0.9);
  color: #fff;
}

.ws-doc__meta-sep {
  opacity: 0.55;
}

.ws-doc__editor {
  margin-top: 10px;
}

:deep(.ws-doc__content .el-textarea__inner) {
  border: none;
  box-shadow: none;
  background: transparent;
  padding: 0;
  font-size: 15px;
  line-height: 1.9;
  color: var(--el-text-color-primary);
}

</style>
