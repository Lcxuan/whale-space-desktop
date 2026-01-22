/**
 * 生成带前缀的唯一 id
 * - 优先使用 crypto.randomUUID（更可靠）
 * - 低版本环境回退到 时间戳 + 随机数
 */
export const createId = (prefix = 'id') => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}_${crypto.randomUUID()}`
  }
  // 回退实现不保证全局唯一，但足够满足本地文档等弱唯一场景
  const random = Math.random().toString(16).slice(2)
  const time = Date.now().toString(16)
  return `${prefix}_${time}_${random}`
}
