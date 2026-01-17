/**
 * 防抖：在连续触发时只在最后一次触发后的 waitMs 执行
 * @param fn 需要防抖的函数
 * @param waitMs 等待毫秒数
 */
export function debounce<TArgs extends unknown[]>(
  fn: (...args: TArgs) => void,
  waitMs: number
) {
  let timer: number | null = null
  return (...args: TArgs) => {
    // 重置上一次的定时器，确保只执行最后一次
    if (timer) window.clearTimeout(timer)
    timer = window.setTimeout(() => fn(...args), waitMs)
  }
}
