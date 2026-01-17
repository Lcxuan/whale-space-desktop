import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { storage } from '../utils/storage'

// 主题模式（浅色 / 深色）
export type ThemeMode = 'light' | 'dark'

// 主题模式本地持久化 key
const THEME_KEY = 'whale_space_theme_mode'

export const useAppStore = defineStore('app', () => {
  // 当前主题：默认 light，init() 会从本地存储回放一次
  const theme = ref<ThemeMode>('light')

  const isDark = computed(() => theme.value === 'dark')

  /**
   * 设置窗口圆角
   */
  function applyWindowRadius(px: number) {
    document.documentElement.style.setProperty('--ws-window-radius', `${px}px`)
  }

  /**
   * 初始化窗口圆角：
   * - 桌面端：根据系统版本做差异化处理（例如 Windows 10/11）
   */
  async function initWindowRadius() {
    // 桌面端需要根据系统差异处理窗口圆角
    const isTauri = Boolean((window as any).__TAURI__)
    if (!isTauri) {
      applyWindowRadius(12)
      return
    }

    try {
      // Windows 10/11 的窗口圆角处理
      // - Windows 11 使用圆角
      // - Windows 10 关闭圆角，使用直角
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

  /**
   * 应用主题
   */
  function applyTheme(next: ThemeMode) {
    theme.value = next
    const root = document.documentElement
    root.classList.toggle('dark', next === 'dark')
    storage.set(THEME_KEY, next)
  }

  /**
   * 切换主题
   */
  function toggleTheme() {
    applyTheme(theme.value === 'dark' ? 'light' : 'dark')
  }

  /**
   * 应用启动初始化
   */
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
