<!-- 组件：主题切换按钮 -->
<template>
  <el-button :icon="icon" @click="onToggle" circle size="small" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Moon, Sunny } from '@element-plus/icons-vue'
import { useAppStore } from '../stores/app'

const appStore = useAppStore()

const icon = computed(() => (appStore.isDark ? Sunny : Moon))

const onToggle = () => {
  appStore.toggleTheme()
}
</script>
