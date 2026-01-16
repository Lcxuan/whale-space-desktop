<template>
  <el-button :icon="icon" @click="onToggle" circle />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Moon, Sunny } from '@element-plus/icons-vue'
import { useAppStore } from '../stores/app'

const appStore = useAppStore()

const icon = computed(() => (appStore.isDark ? Sunny : Moon))

function onToggle() {
  appStore.toggleTheme()
}
</script>

