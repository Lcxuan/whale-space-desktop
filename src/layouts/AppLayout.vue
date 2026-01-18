<template>
  <div class="ws-shell" :style="shellStyle">
    <WindowTitleBar />
    <el-container class="ws-body">
      <el-aside width="var(--ws-aside-width)" class="ws-aside">
        <div class="ws-aside__inner">
          <el-menu :default-active="activeMenu" :default-openeds="defaultOpeneds" router class="ws-menu">
            <el-menu-item index="/">
              <el-icon><HomeFilled /></el-icon>
              <span>开始</span>
            </el-menu-item>
            <el-menu-item index="/notes">
              <el-icon><Edit /></el-icon>
              <span>小记</span>
            </el-menu-item>
            <el-menu-item index="/knowledge">
              <el-icon><Collection /></el-icon>
              <span>知识库</span>
            </el-menu-item>
            <el-sub-menu index="docs-library" class="ws-doclib-menu">
              <template #title>
                <div class="ws-doclib-root">
                  <el-icon><Document /></el-icon>
                  <span class="ws-doclib-root__text">我的文档库</span>
                  <el-dropdown trigger="click" @command="onRootCreateCommand">
                    <span class="ws-doclib-root__plus" @click.stop>
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
              <DocLibraryMenu />
            </el-sub-menu>
          </el-menu>

          <div class="ws-aside__footer">
            <button
              ref="moreButtonEl"
              type="button"
              class="ws-more-button"
              :class="{ 'is-open': isMoreOpen }"
              @click="toggleMore"
            >
              <el-icon><MoreFilled /></el-icon>
              <span>更多</span>
            </button>
          </div>
        </div>
      </el-aside>
      <!-- 拖拽分割条：用于调整侧边栏宽度 -->
      <div class="ws-splitter" @mousedown="onResizeStart" />

      <div v-if="isMoreOpen" ref="morePanelEl" class="ws-more-panel">
        <button type="button" class="ws-more-panel__item" @click="goSettings">
          <el-icon><Setting /></el-icon>
          <span>设置</span>
        </button>
      </div>

      <el-container>
        <el-main :class="['ws-main', { 'ws-main--no-scroll': isHome }]">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import type { CSSProperties } from 'vue'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import WindowTitleBar from '../components/WindowTitleBar.vue'
import DocLibraryMenu from '../components/DocLibraryMenu.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Collection, Document, Edit, HomeFilled, MoreFilled, Plus, Setting } from '@element-plus/icons-vue'
import { useDocsStore } from '../stores/docs'

const route = useRoute()
const router = useRouter()
const docsStore = useDocsStore()


const activeMenu = computed(() => {
  if (route.path === '/') return '/'
  if (route.path === '/notes') return '/notes'
  if (route.path === '/knowledge') return '/knowledge'
  if (route.path.startsWith('/editor/')) return route.path
  return ''
})

const defaultOpeneds = computed(() => {
  return ['docs-library']
})

// 侧边栏允许拖拽的宽度范围
const ASIDE_MIN_WIDTH = 200
const ASIDE_MAX_WIDTH = 320

// 用于保证标题栏左侧与侧栏对齐
const asideWidth = ref(ASIDE_MIN_WIDTH)
const isResizing = ref(false)

const shellStyle = computed<CSSProperties>(() => ({
  '--ws-aside-width': `${asideWidth.value}px`,
}))

// 更多按钮设置
const isMoreOpen = ref(false)
const moreButtonEl = ref<HTMLElement | null>(null)
const morePanelEl = ref<HTMLElement | null>(null)

// 首页主区域不滚动，避免出现“内容区 + 内层滚动条”的双滚动体验
const isHome = computed(() => route.name === 'home')

// 页面标题：用于 header 展示，也可作为后续面包屑/路由元信息的兜底
const title = computed(() => {
  if (route.name === 'home') return '开始'
  if (route.name === 'docs') return '我的文档库'
  if (route.name === 'notes') return '小记'
  if (route.name === 'knowledge') return '知识库'
  if (route.name === 'settings') return '设置'
  if (route.name === 'editor') return '编辑器'
  return 'Whale Space'
})

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

// 切换“更多”弹窗显隐
function toggleMore() {
  isMoreOpen.value = !isMoreOpen.value
}

// 点击弹窗内后跳转，并收起弹窗
function goSettings() {
  isMoreOpen.value = false
  router.push('/settings')
}

async function onRootCreateCommand(cmd: string) {
  if (cmd === 'doc') {
    const title = await promptText('请输入文档标题', '新建文档', '未命名文档')
    if (!title) return
    const doc = docsStore.create(title, null)
    router.push(`/editor/${doc.id}`)
    ElMessage.success('已新建文档')
    return
  }

  if (cmd === 'folder') {
    const name = await promptText('请输入文件夹名称', '新建文件夹', '未命名文件夹')
    if (!name) return
    docsStore.createFolder(name, null)
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

// 全局捕获鼠标按下：点击弹窗/按钮之外的区域时，自动收起弹窗
function onGlobalMouseDown(e: MouseEvent) {
  // 如果弹窗未打开，直接返回
  if (!isMoreOpen.value) return
  const target = e.target as Node | null
  // 如果事件目标为空，直接返回
  if (!target) return
  // 如果点击的是“更多”按钮本身，不关闭弹窗
  if (moreButtonEl.value?.contains(target)) return
  // 如果点击的是弹窗内部，不关闭弹窗
  if (morePanelEl.value?.contains(target)) return
  // 其余情况：点击外部，关闭弹窗
  isMoreOpen.value = false
}

// 拖拽侧栏时，统一设置全局光标与选中文本行为，避免拖动过程中误选中页面内容
function setBodyResizing(active: boolean) {
  if (!document?.body) return
  document.body.style.cursor = active ? 'col-resize' : ''
  document.body.style.userSelect = active ? 'none' : ''
}

function onResizeStart(e: MouseEvent) {
  // 仅响应鼠标左键拖拽
  if (e.button !== 0) return
  e.preventDefault()

  const startX = e.clientX
  const startWidth = asideWidth.value
  isResizing.value = true
  setBodyResizing(true)

  const onMove = (ev: MouseEvent) => {
    const next = startWidth + (ev.clientX - startX)
    asideWidth.value = clamp(Math.round(next), ASIDE_MIN_WIDTH, ASIDE_MAX_WIDTH)
  }

  const onUp = () => {
    isResizing.value = false
    setBodyResizing(false)
    window.removeEventListener('mousemove', onMove)
    window.removeEventListener('mouseup', onUp)
    // 记住用户调整后的宽度，刷新/重启后仍保持一致
    localStorage.setItem('ws_aside_width', String(asideWidth.value))
  }

  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup', onUp)
}

onMounted(() => {
  docsStore.load()
  // 启动时回放上次保存的侧栏宽度
  const cached = Number(localStorage.getItem('ws_aside_width'))
  if (Number.isFinite(cached) && cached > 0) {
    asideWidth.value = clamp(Math.round(cached), ASIDE_MIN_WIDTH, ASIDE_MAX_WIDTH)
  }

  // 使用 capture 以尽可能早地接收到事件，保证“点击外部关闭”行为稳定
  window.addEventListener('mousedown', onGlobalMouseDown, true)
})

onBeforeUnmount(() => {
  // 如果组件卸载时仍处于拖拽态，确保全局样式被正确还原
  window.removeEventListener('mousedown', onGlobalMouseDown, true)
  if (!isResizing.value) return
  setBodyResizing(false)
})

watch(
  () => route.path,
  () => {
    // 路由切换时兜底收起弹窗，避免弹窗残留在新页面
    isMoreOpen.value = false
  },
)
</script>

<style scoped lang="scss">
.ws-shell {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.ws-body {
  flex: 1;
  min-height: 0;
  position: relative;
}

.ws-aside {
  box-sizing: border-box;
  min-width: 200px;
  width: var(--ws-aside-width) !important;
  border-right: 1px solid var(--el-border-color);
  background: var(--el-bg-color);
}

.ws-aside__inner {
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.ws-splitter {
  width: 10px;
  margin-left: -5px;
  margin-right: -5px;
  cursor: col-resize;
  user-select: none;
  background: transparent;
}

.ws-menu {
  border-right: none;
  padding: 8px;
  flex: 1;
  min-height: 0;
  overflow: auto;
  --el-menu-item-height: 42px;
  --el-menu-sub-item-height: 42px;
  --el-menu-base-level-padding: 14px;
}

:deep(.ws-menu .ws-doclib-menu) {
  position: relative;
  margin-top: 16px;
  padding-top: 16px;
}

:deep(.ws-menu .ws-doclib-menu::before) {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 1px;
  background: var(--el-border-color);
}

:deep(.ws-menu .ws-doclib-root) {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

:deep(.ws-menu .ws-doclib-root .el-icon) {
  margin-right: 0;
}

:deep(.ws-menu .ws-doclib-root__text) {
  flex: 1;
}

:deep(.ws-menu .ws-doclib-root__plus) {
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

:deep(.ws-menu .ws-doclib-root__plus:hover) {
  background: var(--el-fill-color);
}

:deep(.ws-menu .el-menu-item) {
  margin: 4px 0;
  border-radius: 10px;
}

:deep(.ws-menu .el-menu-item .el-icon) {
  margin-right: 6px;
}

:deep(.ws-menu .el-sub-menu__title) {
  margin: 4px 0;
  border-radius: 10px;
  padding-right: 14px;
}

:deep(.ws-menu .el-sub-menu__title:hover) {
  background: var(--el-fill-color);
}

:deep(.ws-menu .el-sub-menu.is-active > .el-sub-menu__title) {
  background: var(--el-fill-color-light);
}

:deep(.ws-menu .el-sub-menu__icon-arrow) {
  position: static;
  top: auto;
  right: auto;
  left: auto;
  margin-top: 0;
  width: auto;
  flex-shrink: 0;
  order: -1;
  margin-right: 6px;
}

:deep(.ws-menu .el-menu-item.is-active) {
  background: var(--el-fill-color-light);
}

:deep(.ws-menu .el-menu-item:not(.is-active):hover) {
  background: var(--el-fill-color);
}

.ws-aside__footer {
  padding: 8px;
  flex-shrink: 0;
}

.ws-more-button {
  width: 100%;
  height: 42px;
  padding: 0 14px;
  margin: 4px 0;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--el-text-color-regular);
  font-size: 14px;
}

.ws-more-button:hover {
  background: var(--el-fill-color);
}

.ws-more-button.is-open {
  background: var(--el-fill-color-light);
}

.ws-more-panel {
  position: absolute;
  left: calc(var(--ws-aside-width) + 8px);
  bottom: 12px;
  width: 220px;
  padding: 8px;
  border-radius: 12px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  box-shadow: var(--el-box-shadow-light);
  z-index: 50;
}

.ws-more-panel__item {
  width: 100%;
  height: 38px;
  padding: 0 12px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--el-text-color-regular);
  font-size: 14px;
}

.ws-more-panel__item:hover {
  background: var(--el-fill-color);
}

.ws-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  border-bottom: 1px solid var(--el-border-color);
  background: var(--el-bg-color);
}

.ws-header__path {
  font-size: 16px;
  font-weight: 600;
}

.ws-main {
  padding: 0 16px 16px;
  min-height: 0;
}

.ws-main--no-scroll {
  overflow: hidden;
}
</style>
