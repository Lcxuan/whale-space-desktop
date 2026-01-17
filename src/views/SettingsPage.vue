<!-- 设置页 -->
<template>
  <el-card>
    <template #header>
      <span>设置</span>
    </template>
    <el-space direction="vertical" fill>
      <el-form label-width="120px">
        <el-form-item label="主题模式">
          <el-segmented v-model="mode" :options="options" />
        </el-form-item>
      </el-form>
      <el-divider />
      <el-text type="info">
        后续可在这里接入：账号登录、服务端文档同步、协同编辑（WebSocket）、版本历史与权限体系。
      </el-text>
    </el-space>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '../stores/app'
import type { ThemeMode } from '../stores/app'

const appStore = useAppStore()

const options = [
  { label: '浅色', value: 'light' },
  { label: '深色', value: 'dark' }
]

const mode = computed<ThemeMode>({
  get() {
    return appStore.theme
  },
  set(v) {
    appStore.applyTheme(v)
  }
})
</script>
