<template>
  <template v-for="folder in childFolders" :key="folder.id">
    <el-sub-menu :index="folderIndex(folder.id)">
      <template #title>
        <div class="ws-doclib__title">
          <el-icon><Folder /></el-icon>
          <span class="ws-doclib__title-text">{{ folder.name }}</span>
          <el-dropdown trigger="click" @command="onFolderCreateCommand(folder.id)">
            <span class="ws-doclib__plus" @click.stop>
              <el-icon><Plus /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="doc">新建文档</el-dropdown-item>
                <el-dropdown-item command="folder">新建文件夹</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </template>
      <DocLibraryMenu :parent-id="folder.id" />
    </el-sub-menu>
  </template>

  <el-menu-item v-for="doc in childDocs" :key="doc.id" :index="`/editor/${doc.id}`">
    <el-icon><Document /></el-icon>
    <span>{{ doc.title }}</span>
  </el-menu-item>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { useDocsStore } from '../stores/docs'
import { Document, Folder, Plus } from '@element-plus/icons-vue'

defineOptions({ name: 'DocLibraryMenu' })

const props = defineProps<{
  parentId?: string | null
}>()

const router = useRouter()
const docsStore = useDocsStore()

const parentId = computed(() => props.parentId ?? null)

const childFolders = computed(() => {
  return [...docsStore.folders]
    .filter((f) => f.parentId === parentId.value)
    .sort((a, b) => b.updatedAt - a.updatedAt)
})

const childDocs = computed(() => {
  return [...docsStore.docs]
    .filter((d) => (d.folderId ?? null) === parentId.value)
    .sort((a, b) => b.updatedAt - a.updatedAt)
})

function folderIndex(id: string) {
  return `folder:${id}`
}

function onFolderCreateCommand(targetFolderId: string) {
  return (cmd: string) => onCreateCommand(cmd, targetFolderId)
}

async function onCreateCommand(cmd: string, targetFolderId: string) {
  if (cmd === 'doc') {
    const title = await promptText('请输入文档标题', '新建文档', '未命名文档')
    if (!title) return
    const doc = docsStore.create(title, targetFolderId)
    router.push(`/editor/${doc.id}`)
    ElMessage.success('已新建文档')
    return
  }

  if (cmd === 'folder') {
    const name = await promptText('请输入文件夹名称', '新建文件夹', '未命名文件夹')
    if (!name) return
    docsStore.createFolder(name, targetFolderId)
    ElMessage.success('已新建文件夹')
  }
}

async function promptText(message: string, title: string, inputValue: string) {
  const { value } = await ElMessageBox.prompt(message, title, {
    inputValue,
    confirmButtonText: '保存',
    cancelButtonText: '取消'
  }).catch(() => ({ value: '' as unknown as string }))
  return value?.trim() ?? ''
}
</script>

<style scoped>
.ws-doclib__title {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.ws-doclib__title :deep(.el-icon) {
  margin-right: 0;
}

.ws-doclib__title-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ws-doclib__plus {
  width: 16px;
  height: 16px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--el-text-color-regular);
  flex-shrink: 0;
  font-size: 10px;
}

.ws-doclib__plus:hover {
  background: var(--el-fill-color);
}
</style>
