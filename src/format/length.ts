import { AU, KILOMETER, LIGHT_YEAR } from '@/physics/constants'
import { formatNumber } from './number'

/** Верхняя граница (в метрах), до которой используется единица. */
const SCALES: readonly { below: number; size: number; label: string }[] = [
  { below: 1, size: 1e-3, label: 'мм' },
  { below: KILOMETER, size: 1, label: 'м' },
  { below: 1e11, size: KILOMETER, label: 'км' },
  { below: 0.1 * LIGHT_YEAR, size: AU, label: 'а.е.' },
]

/** Длина в метрах → строка в подходящих единицах: «8,87 мм», «2,95 км», «0,5 св. лет». */
export function formatLength(meters: number, significantDigits = 3): string {
  if (!Number.isFinite(meters)) return '—'
  const scale = SCALES.find((s) => Math.abs(meters) < s.below)
  const size = scale?.size ?? LIGHT_YEAR
  const label = scale?.label ?? 'св. лет'
  return `${formatNumber(meters / size, significantDigits)} ${label}`
}
