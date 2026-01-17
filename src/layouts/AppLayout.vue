<template>
  <div class="ws-shell" :style="shellStyle">
    <WindowTitleBar />
    <el-container class="ws-body">
      <el-aside width="var(--ws-aside-width)" class="ws-aside">
        <el-menu :default-active="activeMenu" router class="ws-menu">
          <el-menu-item index="/">
            <el-icon><HomeFilled /></el-icon>
            <span>开始</span>
          </el-menu-item>
          <el-menu-item index="/docs">
            <el-icon><Document /></el-icon>
            <span>文档</span>
          </el-menu-item>
          <el-menu-item index="/settings">
            <el-icon><Setting /></el-icon>
            <span>设置</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <!-- 拖拽分割条：用于调整侧边栏宽度 -->
      <div class="ws-splitter" @mousedown="onResizeStart" />

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
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import WindowTitleBar from '../components/WindowTitleBar.vue'
import { Document, HomeFilled, Setting } from '@element-plus/icons-vue'

const route = useRoute()

const activeMenu = computed(() => route.path)

// 侧边栏允许拖拽的宽度范围
const ASIDE_MIN_WIDTH = 200
const ASIDE_MAX_WIDTH = 320

// 用于保证标题栏左侧与侧栏对齐
const asideWidth = ref(ASIDE_MIN_WIDTH)
const isResizing = ref(false)

const shellStyle = computed<CSSProperties>(() => ({
  '--ws-aside-width': `${asideWidth.value}px`,
}))

// 首页主区域不滚动，避免出现“内容区 + 内层滚动条”的双滚动体验
const isHome = computed(() => route.name === 'home')

// 页面标题：用于 header 展示，也可作为后续面包屑/路由元信息的兜底
const title = computed(() => {
  if (route.name === 'home') return '开始'
  if (route.name === 'docs') return '文档'
  if (route.name === 'settings') return '设置'
  if (route.name === 'editor') return '编辑器'
  return 'Whale Space'
})

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
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
  // 启动时回放上次保存的侧栏宽度
  const cached = Number(localStorage.getItem('ws_aside_width'))
  if (Number.isFinite(cached) && cached > 0) {
    asideWidth.value = clamp(Math.round(cached), ASIDE_MIN_WIDTH, ASIDE_MAX_WIDTH)
  }
})

onBeforeUnmount(() => {
  // 如果组件卸载时仍处于拖拽态，确保全局样式被正确还原
  if (!isResizing.value) return
  setBodyResizing(false)
})
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
}

.ws-aside {
  box-sizing: border-box;
  min-width: 200px;
  width: var(--ws-aside-width) !important;
  border-right: 1px solid var(--el-border-color);
  background: var(--el-bg-color);
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
}

:deep(.ws-menu .el-menu-item) {
  height: 42px;
  padding: 0 14px;
  margin: 4px 0;
  border-radius: 10px;
}

:deep(.ws-menu .el-menu-item .el-icon) {
  margin-right: 8px;
}

:deep(.ws-menu .el-menu-item.is-active) {
  background: var(--el-fill-color-light);
}

:deep(.ws-menu .el-menu-item:not(.is-active):hover) {
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
