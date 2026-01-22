// 轻量存储封装：当前实现为内存存储
const memoryStorage = new Map<string, string>()

const getLocalStorage = () => {
  try {
    if (typeof window === 'undefined') return null
    if (!('localStorage' in window)) return null
    return window.localStorage
  } catch {
    return null
  }
}

export const storage = {
  /**
   * 读取并反序列化
   * @returns 解析失败或 key 不存在时返回 null
   */
  get: <T>(key: string): T | null => {
    try {
      const ls = getLocalStorage()
      const raw = ls ? ls.getItem(key) : memoryStorage.get(key)
      if (!raw) return null
      return JSON.parse(raw) as T
    } catch {
      return null
    }
  },
  /**
   * 序列化并写入（写入失败直接忽略，避免影响主流程）
   */
  set: <T>(key: string, value: T) => {
    try {
      const raw = JSON.stringify(value)
      const ls = getLocalStorage()
      if (ls) {
        ls.setItem(key, raw)
        return
      }
      memoryStorage.set(key, raw)
    } catch {
      return
    }
  },
  /**
   * 删除指定 key
   */
  remove: (key: string) => {
    try {
      const ls = getLocalStorage()
      if (ls) {
        ls.removeItem(key)
        return
      }
      memoryStorage.delete(key)
    } catch {
      return
    }
  }
}
