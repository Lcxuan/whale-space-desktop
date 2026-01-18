<!-- 组件：窗口标题栏 -->
<template>
  <div class="ws-titlebar">
    <!-- 可拖拽区域：在 Tauri 窗口中用于拖动/双击最大化 -->
    <div class="ws-titlebar__drag" data-tauri-drag-region @dblclick="onToggleMaximize">
      <div class="ws-titlebar__left" data-tauri-drag-region>
        <div class="ws-titlebar__brand">
          <div class="ws-titlebar__brand-title">Whale Space</div>
          <div class="ws-titlebar__brand-sub">桌面端</div>
        </div>
      </div>
      <div class="ws-titlebar__fill" data-tauri-drag-region>
        <Recents />
      </div>
    </div>

    <div v-if="isTauri" class="ws-titlebar__actions">
      <ThemeToggle />
      <button class="ws-titlebar__btn" type="button" @click="onMinimize" aria-label="minimize">
        <el-icon><Minus /></el-icon>
      </button>
      <button class="ws-titlebar__btn" type="button" @click="onToggleMaximize" aria-label="maximize">
        <el-icon><FullScreen /></el-icon>
      </button>
      <button
        class="ws-titlebar__btn ws-titlebar__btn--danger"
        type="button"
        @click="onClose"
        aria-label="close"
      >
        <el-icon><Close /></el-icon>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { appWindow } from '@tauri-apps/api/window'
import { Close, FullScreen, Minus } from '@element-plus/icons-vue'
import ThemeToggle from './ThemeToggle.vue'
import Recents from './Recents.vue'

// 兼容“网页模式”(vite dev/preview) 与 “桌面模式”(Tauri)：
// 非 Tauri 环境不渲染窗口控制按钮，也不调用 appWindow API
const isTauri = computed(() => Boolean((window as any).__TAURI__))

async function onMinimize() {
  if (!isTauri.value) return
  await appWindow.minimize()
}

async function onToggleMaximize() {
  if (!isTauri.value) return
  await appWindow.toggleMaximize()
}

async function onClose() {
  if (!isTauri.value) return
  await appWindow.close()
}
</script>

<style scoped lang="scss">
.ws-titlebar {
  height: 52px;
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  background: var(--el-bg-color);
  user-select: none;
}

.ws-titlebar__drag {
  flex: 1;
  display: flex;
  align-items: center;
  min-width: 0;
}

.ws-titlebar__left {
  /* 与侧边栏保持一致宽度，避免分割线/布局出现错位（由 AppLayout 下发 --ws-aside-width） */
  width: var(--ws-aside-width);
  box-sizing: border-box;
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 14px;
  border-right: 1px solid var(--el-border-color);
  min-width: 0;
}

.ws-titlebar__fill {
  flex: 1;
  height: 100%;
  display: flex;
  align-items: center;
  min-width: 0;
}

.ws-titlebar__brand {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
  gap: 6px;
  padding-top: 6px;
}

.ws-titlebar__brand-title {
  font-size: 16px;
  font-weight: 600;
  line-height: 1.1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ws-titlebar__brand-sub {
  font-size: 12px;
  opacity: 0.7;
  line-height: 1.1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ws-titlebar__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 6px;
}

.ws-titlebar__btn {
  width: 40px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--el-text-color-primary);
  border-radius: 10px;
}

.ws-titlebar__btn:hover {
  background: var(--el-fill-color-light);
}

.ws-titlebar__btn--danger:hover {
  background: var(--el-color-danger);
  color: var(--el-color-white);
}

.ws-titlebar__actions :deep(.el-button.is-circle) {
  width: 32px;
  height: 32px;
  padding: 0;
  border-radius: 10px;
}

.ws-titlebar__actions :deep(.el-button.is-circle .el-icon) {
  font-size: 14px;
}

.ws-titlebar__btn :deep(.el-icon) {
  font-size: 14px;
}
</style>
