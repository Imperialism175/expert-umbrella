const NUMBER_PATTERN = /^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i

/**
 * Разбирает число, введённое пользователем: десятичная запятая или точка,
 * пробелы между разрядами, научная запись («4,3e6»). null — если это не число.
 */
export function parseNumber(text: string): number | null {
  const normalized = text
    .replace(/[\s  ]/g, '')
    .replace(',', '.')
    .replace('−', '-')
  if (!NUMBER_PATTERN.test(normalized)) return null
  const value = Number(normalized)
  return Number.isFinite(value) ? value : null
}

/** Число → текст для поля ввода: без разделителей разрядов, чтобы его можно было править. */
export function toInputText(value: number): string {
  return String(Number(value.toPrecision(10)))
    .replace('e+', 'e')
    .replace('.', ',')
}
