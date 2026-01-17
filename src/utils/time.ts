/**
 * 将时间戳格式化为可读字符串（yyyy-MM-dd HH:mm）
 * @param ms 时间戳（毫秒）
 */
export function formatTime(ms: number) {
  const d = new Date(ms)
  const yyyy = d.getFullYear()
  // 月份从 0 开始，需要 +1
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`
}
