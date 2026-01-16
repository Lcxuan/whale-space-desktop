export function debounce<TArgs extends unknown[]>(
  fn: (...args: TArgs) => void,
  waitMs: number
) {
  let timer: number | null = null
  return (...args: TArgs) => {
    if (timer) window.clearTimeout(timer)
    timer = window.setTimeout(() => fn(...args), waitMs)
  }
}

