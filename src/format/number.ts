const SUPERSCRIPT_DIGITS = '⁰¹²³⁴⁵⁶⁷⁸⁹'
const MINUS = '−'
const NBSP = ' '

/** Вне этого диапазона числа пишутся в научной записи. */
const PLAIN_MIN = 1e-3
const PLAIN_MAX = 1e9

function localize(value: number, significantDigits: number): string {
  return new Intl.NumberFormat('ru-RU', {
    maximumSignificantDigits: significantDigits,
  })
    .format(value)
    .replace(/[  ]/g, NBSP)
    .replace('-', MINUS)
}

function superscript(exponent: number): string {
  const digits = [...String(Math.abs(exponent))]
    .map((d) => SUPERSCRIPT_DIGITS[Number(d)])
    .join('')
  return (exponent < 0 ? '⁻' : '') + digits
}

/**
 * Число с заданным количеством значащих цифр в русской записи:
 * «0,707», «4 300 000», «6,5 × 10⁹».
 */
export function formatNumber(value: number, significantDigits = 3): string {
  if (!Number.isFinite(value)) return '—'
  if (value === 0) return '0'

  const abs = Math.abs(value)
  if (abs >= PLAIN_MIN && abs < PLAIN_MAX) {
    return localize(value, significantDigits)
  }

  // toExponential сам корректно переносит разряд (9,99e5 → 1,00e6).
  const [mantissa = '0', exponent = '0'] = value
    .toExponential(significantDigits - 1)
    .split('e')
  return `${localize(Number(mantissa), significantDigits)} × 10${superscript(Number(exponent))}`
}
