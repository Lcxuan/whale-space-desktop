import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(async () => ({
  plugins: [vue()],
  clearScreen: false,
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern'
      }
    }
  },
  server: {
    port: 1420,
    strictPort: true,
    watch: {
      ignored: ['**/src-tauri/**']
    }
  }
}))
