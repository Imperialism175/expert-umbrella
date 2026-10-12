import { DAY, HOUR, MINUTE, YEAR } from '@/physics/constants'
import { formatNumber } from './number'

/** Формы слова для 1, 2–4 и 5+ («год», «года», «лет»). */
type Forms = readonly [one: string, few: string, many: string]

const SECOND_FORMS: Forms = ['секунда', 'секунды', 'секунд']

const UNITS: readonly { seconds: number; forms: Forms }[] = [
  { seconds: YEAR, forms: ['год', 'года', 'лет'] },
  { seconds: YEAR / 12, forms: ['месяц', 'месяца', 'месяцев'] },
  { seconds: DAY, forms: ['день', 'дня', 'дней'] },
  { seconds: HOUR, forms: ['час', 'часа', 'часов'] },
  { seconds: MINUTE, forms: ['минута', 'минуты', 'минут'] },
  { seconds: 1, forms: SECOND_FORMS },
]

const SUBSECOND_UNITS: readonly { seconds: number; label: string }[] = [
  { seconds: 1e-3, label: 'мс' },
  { seconds: 1e-6, label: 'мкс' },
  { seconds: 1e-9, label: 'нс' },
  { seconds: 1e-12, label: 'пс' },
]

const LARGE_YEAR_SCALES: readonly { years: number; label: string }[] = [
  { years: 1e9, label: 'млрд лет' },
  { years: 1e6, label: 'млн лет' },
  { years: 1e3, label: 'тыс. лет' },
]

/** С этого числа лет вместо «N лет M месяцев» пишем «12,3 тыс. лет». */
const LARGE_YEARS_FROM = 1e4
/** Выше — научная запись. */
const LARGE_YEARS_TO = 1e12

/** Защита от ошибок округления при делении на размер единицы. */
const EPSILON = 1e-9

export function pluralize(count: number, forms: Forms): string {
  const n = Math.abs(count) % 100
  const last = n % 10
  if (n > 10 && n < 20) return forms[2]
  if (last === 1) return forms[0]
  if (last >= 2 && last <= 4) return forms[1]
  return forms[2]
}

function formatComposite(seconds: number, maxParts: number): string {
  const first = Math.max(
    0,
    UNITS.findIndex((unit) => seconds >= unit.seconds),
  )
  const last = Math.min(first + maxParts - 1, UNITS.length - 1)

  const counts: number[] = []
  let rest = seconds
  for (let i = first; i < last; i++) {
    const size = UNITS[i]!.seconds
    const count = Math.floor(rest / size + EPSILON)
    counts.push(count)
    rest = Math.max(0, rest - count * size)
  }
  const lastSize = UNITS[last]!.seconds
  const lastCount = Math.round(rest / lastSize)

  // Младшая часть округлилась до целой старшей единицы («59 мин 60 с»):
  // переносим разряд и форматируем заново.
  const above = UNITS[last - 1]
  if (above && lastCount * lastSize >= above.seconds) {
    return formatComposite(seconds - rest + above.seconds, maxParts)
  }
  counts.push(lastCount)

  const parts = counts
    .map((count, i) => ({ count, forms: UNITS[first + i]!.forms }))
    .filter((part) => part.count > 0)
    .map((part) => `${part.count} ${pluralize(part.count, part.forms)}`)
  return parts.join(' ')
}

function formatSeconds(seconds: number): string {
  const rounded = Number(seconds.toPrecision(3))
  if (rounded >= MINUTE) return formatComposite(MINUTE, 1)
  const word = Number.isInteger(rounded)
    ? pluralize(rounded, SECOND_FORMS)
    : SECOND_FORMS[1]
  return `${formatNumber(rounded)} ${word}`
}

function formatSubsecond(seconds: number): string {
  const unit = SUBSECOND_UNITS.find((u) => seconds >= u.seconds)
  if (!unit) return `${formatNumber(seconds)} с`
  return `${formatNumber(seconds / unit.seconds)} ${unit.label}`
}

function formatLargeYears(years: number): string {
  if (years >= LARGE_YEARS_TO) return `${formatNumber(years)} лет`
  const scale = LARGE_YEAR_SCALES.find((s) => years >= s.years)!
  return `${formatNumber(years / scale.years)} ${scale.label}`
}

/**
 * Длительность в секундах → читаемая строка: от «50 мкс» через
 * «8 месяцев 15 дней» до «4,5 млрд лет». maxParts — сколько старших
 * единиц показывать в составной записи.
 */
export function formatDuration(seconds: number, maxParts = 2): string {
  if (!Number.isFinite(seconds)) return '—'
  if (seconds < 0) return `−${formatDuration(-seconds, maxParts)}`
  if (seconds === 0) return `0 ${SECOND_FORMS[2]}`

  if (seconds < 1) return formatSubsecond(seconds)
  if (seconds < MINUTE) return formatSeconds(seconds)
  const years = seconds / YEAR
  if (years >= LARGE_YEARS_FROM) return formatLargeYears(years)
  return formatComposite(seconds, maxParts)
}
