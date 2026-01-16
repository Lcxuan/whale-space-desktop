import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { storage } from '../utils/storage'

export type ThemeMode = 'light' | 'dark'

const THEME_KEY = 'whale_space_theme_mode'

export const useAppStore = defineStore('app', () => {
  const theme = ref<ThemeMode>('light')

  const isDark = computed(() => theme.value === 'dark')

  function applyTheme(next: ThemeMode) {
    theme.value = next
    const root = document.documentElement
    root.classList.toggle('dark', next === 'dark')
    storage.set(THEME_KEY, next)
  }

  function toggleTheme() {
    applyTheme(theme.value === 'dark' ? 'light' : 'dark')
  }

  function init() {
    const saved = storage.get<ThemeMode>(THEME_KEY)
    applyTheme(saved === 'dark' ? 'dark' : 'light')
  }

  return {
    theme,
    isDark,
    applyTheme,
    toggleTheme,
    init
  }
})

