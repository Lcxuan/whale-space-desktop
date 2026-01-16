const memoryStorage = new Map<string, string>()

export const storage = {
  get<T>(key: string): T | null {
    try {
      const raw = memoryStorage.get(key)
      if (!raw) return null
      return JSON.parse(raw) as T
    } catch {
      return null
    }
  },
  set<T>(key: string, value: T) {
    try {
      memoryStorage.set(key, JSON.stringify(value))
    } catch {
      return
    }
  },
  remove(key: string) {
    try {
      memoryStorage.delete(key)
    } catch {
      return
    }
  }
}

