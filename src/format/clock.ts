const pad = (value: number) => String(value).padStart(2, '0')

/** Показания таймера: «01:07.4», а после часа — «1:01:07.4». */
export function formatClock(seconds: number): string {
  const tenths = Math.floor(Math.max(0, seconds) * 10)
  const wholeSeconds = Math.floor(tenths / 10)
  const minutes = Math.floor(wholeSeconds / 60)
  const tail = `${pad(wholeSeconds % 60)}.${tenths % 10}`
  if (minutes < 60) return `${pad(minutes)}:${tail}`
  return `${Math.floor(minutes / 60)}:${pad(minutes % 60)}:${tail}`
}
