<!-- 开始页 -->
<template>
  <div class="ws-start">
    <div class="ws-start__title">开始</div>
    <div class="ws-start__actions">
      <div class="ws-action" @click="createDoc('doc')">
        <div class="ws-action__icon ws-action__icon--doc">
          <el-icon><DocumentAdd /></el-icon>
        </div>
        <div class="ws-action__meta">
          <div class="ws-action__title">新建文档</div>
          <div class="ws-action__desc">文档、表格、画板、数据表</div>
        </div>
        <el-dropdown trigger="click" @command="onCreateCommand">
          <span class="ws-action__more" @click.stop>
            <el-icon><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="doc">文档</el-dropdown-item>
              <el-dropdown-item command="sheet">表格</el-dropdown-item>
              <el-dropdown-item command="board">画板</el-dropdown-item>
              <el-dropdown-item command="db">数据表</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>

      <div class="ws-action" @click="createKnowledgeBase">
        <div class="ws-action__icon ws-action__icon--kb">
          <el-icon><Collection /></el-icon>
        </div>
        <div class="ws-action__meta">
          <div class="ws-action__title">新建知识库</div>
          <div class="ws-action__desc">使用知识库整理知识</div>
        </div>
      </div>
    </div>

    <div class="ws-start__recent">
      <div class="ws-start__section">
        <div class="ws-start__section-title">最近访问</div>
      </div>
      <div class="ws-start__recent-scroll">
        <RecentList />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import RecentList from '../components/RecentList.vue'
import { useDocsStore } from '../stores/docs'
import { ArrowDown, Collection, DocumentAdd } from '@element-plus/icons-vue'

const router = useRouter()
const docsStore = useDocsStore()

type CreateKind = 'doc' | 'sheet' | 'board' | 'db'

const createDoc = (kind: CreateKind) => {
  const defaultTitle =
    kind === 'sheet'
      ? '未命名表格'
      : kind === 'board'
        ? '未命名画板'
        : kind === 'db'
          ? '未命名数据表'
          : '未命名文档'

  // 创建并立即记录一次访问
  const doc = docsStore.create(defaultTitle)
  docsStore.touchVisit(doc.id)
  router.push(`/editor/${doc.id}`)
}

const onCreateCommand = (command: string | number | object) => {
  createDoc(command as CreateKind)
}

const createKnowledgeBase = () => {
  ElMessage.info('知识库功能暂未实现')
}
</script>

<style scoped>
.ws-start {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.ws-start__title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
}

.ws-start__actions {
  display: flex;
  align-items: stretch;
  gap: 12px;
}

.ws-start__recent {
  margin-top: 20px;
  min-height: 0;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.ws-start__recent-scroll {
  min-height: 0;
  flex: 1;
  overflow: hidden;
  border: 1px solid var(--el-border-color);
  border-radius: 10px;
  padding: 8px;
  background: var(--el-bg-color);
}

.ws-start__section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.ws-start__section-title {
  font-size: 18px;
  font-weight: 600;
}

.ws-action {
  width: 240px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid var(--el-border-color);
  border-radius: 10px;
  background: var(--el-bg-color);
  cursor: pointer;
  user-select: none;
}

.ws-action:hover {
  background: var(--el-fill-color-light);
}

.ws-action__icon {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
}

.ws-action__icon--doc {
  background: rgba(64, 158, 255, 0.12);
  color: var(--el-color-primary);
}

.ws-action__icon--kb {
  background: rgba(103, 194, 58, 0.12);
  color: var(--el-color-success);
}

.ws-action__meta {
  min-width: 0;
  flex: 1;
}

.ws-action__title {
  font-size: 14px;
  font-weight: 600;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ws-action__desc {
  font-size: 12px;
  opacity: 0.7;
  margin-top: 2px;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ws-action__more {
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  color: var(--el-text-color-secondary);
}

.ws-action__more:hover {
  background: var(--el-fill-color);
}
</style>
