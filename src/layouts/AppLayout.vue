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
      <div class="ws-splitter" @mousedown="onResizeStart" />

      <el-container>
        <el-header v-if="showPageHeader" height="42px" class="ws-header">
          <div class="ws-header__left">
            <el-text class="ws-header__path">{{ title }}</el-text>
          </div>
        </el-header>
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

const ASIDE_MIN_WIDTH = 200
const ASIDE_MAX_WIDTH = 320

const asideWidth = ref(ASIDE_MIN_WIDTH)
const isResizing = ref(false)

const shellStyle = computed<CSSProperties>(() => ({
  '--ws-aside-width': `${asideWidth.value}px`,
}))

const isHome = computed(() => route.name === 'home')
const showPageHeader = computed(() => route.name === 'editor')

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

function setBodyResizing(active: boolean) {
  if (!document?.body) return
  document.body.style.cursor = active ? 'col-resize' : ''
  document.body.style.userSelect = active ? 'none' : ''
}

function onResizeStart(e: MouseEvent) {
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
    localStorage.setItem('ws_aside_width', String(asideWidth.value))
  }

  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup', onUp)
}

onMounted(() => {
  const cached = Number(localStorage.getItem('ws_aside_width'))
  if (Number.isFinite(cached) && cached > 0) {
    asideWidth.value = clamp(Math.round(cached), ASIDE_MIN_WIDTH, ASIDE_MAX_WIDTH)
  }
})

onBeforeUnmount(() => {
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
  padding-top: 0;
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
