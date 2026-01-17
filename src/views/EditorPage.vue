<!-- 文档编辑页 -->
<template>
  <el-card>
    <template #header>
      <div class="ws-header">
        <el-input v-model="title" placeholder="输入标题" @change="onTitleCommit" />
        <el-space>
          <el-tag v-if="saveState === 'saved'" type="success">已保存</el-tag>
          <el-tag v-else type="info">编辑中…</el-tag>
          <el-button @click="back">返回</el-button>
        </el-space>
      </div>
    </template>

    <div v-if="!doc" class="ws-empty">
      <el-empty description="文档不存在" />
    </div>

    <div v-else class="ws-editor">
      <el-input
        v-model="content"
        type="textarea"
        :autosize="{ minRows: 18 }"
        placeholder="支持 Markdown（当前为基础编辑器，后续可替换为富文本/协同编辑）"
      />
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useDocsStore } from '../stores/docs'
import { debounce } from '../utils/debounce'

const props = defineProps<{ id: string }>()

const router = useRouter()
const docsStore = useDocsStore()

const saveState = ref<'editing' | 'saved'>('saved')
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
  saveState.value = 'saved'
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

// 内容保存采用防抖：连续输入时降低写入频率
const persist = debounce(() => {
  if (!doc.value) return
  docsStore.updateContent(doc.value.id, content.value)
  saveState.value = 'saved'
}, 350)

watch(content, () => {
  if (!doc.value) return
  // 任意内容变更先标记为编辑中，再触发防抖保存
  saveState.value = 'editing'
  persist()
})

function onTitleCommit() {
  if (!doc.value) return
  // 标题提交时做 trim，并兜底未命名
  docsStore.rename(doc.value.id, title.value.trim() || '未命名文档')
}

function back() {
  router.push('/docs')
}
</script>

<style scoped>
.ws-header {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
}

.ws-editor {
  display: grid;
  gap: 12px;
}
</style>
