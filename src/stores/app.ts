import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { storage } from '../utils/storage'

export type ThemeMode = 'light' | 'dark'

const THEME_KEY = 'whale_space_theme_mode'

export const useAppStore = defineStore('app', () => {
  const theme = ref<ThemeMode>('light')

  const isDark = computed(() => theme.value === 'dark')

  function applyWindowRadius(px: number) {
    document.documentElement.style.setProperty('--ws-window-radius', `${px}px`)
  }

  async function initWindowRadius() {
    const isTauri = Boolean((window as any).__TAURI__)
    if (!isTauri) {
      applyWindowRadius(12)
      return
    }

    try {
      const { platform, version } = await import('@tauri-apps/api/os')
      const plat = String(await platform())
      const isWindows = plat === 'windows' || plat === 'win32'
      if (!isWindows) {
        applyWindowRadius(12)
        return
      }

      const ver = await version().catch(() => '')
      const parts = ver.split('.').map((v) => Number(v))
      const build = Number.isFinite(parts[2]) ? (parts[2] as number) : 0
      const isWindows11 = build >= 22000
      applyWindowRadius(isWindows11 ? 12 : 0)
    } catch {
      applyWindowRadius(0)
    }
  }

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
    void initWindowRadius()
  }

  return {
    theme,
    isDark,
    applyTheme,
    toggleTheme,
    init
  }
})
