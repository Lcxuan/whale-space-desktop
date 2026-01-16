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
  const d = docsStore.getById(props.id)
  if (!d) return
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
    docsStore.load()
    syncFromStore()
  }
)

const doc = computed(() => docsStore.getById(props.id))

const persist = debounce(() => {
  if (!doc.value) return
  docsStore.updateContent(doc.value.id, content.value)
  saveState.value = 'saved'
}, 350)

watch(content, () => {
  if (!doc.value) return
  saveState.value = 'editing'
  persist()
})

function onTitleCommit() {
  if (!doc.value) return
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

