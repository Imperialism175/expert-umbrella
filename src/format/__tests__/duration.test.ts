import { describe, expect, it } from 'vitest'
import { DAY, HOUR, MINUTE, YEAR } from '@/physics/constants'
import { formatDuration, pluralize } from '../duration'

const MONTH = YEAR / 12

describe('pluralize', () => {
  const forms = ['год', 'года', 'лет'] as const

  it('выбирает форму слова по числу', () => {
    expect(pluralize(1, forms)).toBe('год')
    expect(pluralize(3, forms)).toBe('года')
    expect(pluralize(5, forms)).toBe('лет')
    expect(pluralize(11, forms)).toBe('лет')
    expect(pluralize(21, forms)).toBe('год')
    expect(pluralize(112, forms)).toBe('лет')
  })
})

describe('formatDuration', () => {
  it('составная запись из двух старших единиц', () => {
    expect(formatDuration(YEAR)).toBe('1 год')
    expect(formatDuration(2 * YEAR + 3 * MONTH)).toBe('2 года 3 месяца')
    expect(formatDuration(YEAR * Math.SQRT1_2)).toBe('8 месяцев 15 дней')
    expect(formatDuration(67)).toBe('1 минута 7 секунд')
    expect(formatDuration(3 * DAY + 5 * HOUR)).toBe('3 дня 5 часов')
    expect(formatDuration(21 * YEAR)).toBe('21 год')
  })

  it('число частей настраивается', () => {
    const value = 2 * DAY + 3 * HOUR + 4 * MINUTE
    expect(formatDuration(value, 1)).toBe('2 дня')
    expect(formatDuration(value, 3)).toBe('2 дня 3 часа 4 минуты')
  })

  it('нулевые части опускаются', () => {
    expect(formatDuration(YEAR + 5 * DAY)).toBe('1 год')
    expect(formatDuration(HOUR + 20)).toBe('1 час')
  })

  it('округление переносит разряд, а не даёт «60 секунд»', () => {
    expect(formatDuration(HOUR - 0.3)).toBe('1 час')
    expect(formatDuration(2 * YEAR - DAY)).toBe('2 года')
    expect(formatDuration(YEAR - DAY)).toBe('11 месяцев 29 дней')
    expect(formatDuration(59.96)).toBe('1 минута')
    expect(formatDuration(59.6 * MINUTE, 1)).toBe('1 час')
  })

  it('секунды — с дробной частью', () => {
    expect(formatDuration(1)).toBe('1 секунда')
    expect(formatDuration(5)).toBe('5 секунд')
    expect(formatDuration(2.5)).toBe('2,5 секунды')
  })

  it('доли секунды — в подходящих единицах', () => {
    expect(formatDuration(0.25)).toBe('250 мс')
    expect(formatDuration(5e-5)).toBe('50 мкс')
    expect(formatDuration(3e-9)).toBe('3 нс')
    expect(formatDuration(2e-12)).toBe('2 пс')
    expect(formatDuration(4.2e-15)).toBe('4,2 × 10⁻¹⁵ с')
  })

  it('огромные интервалы — в тысячах, миллионах и миллиардах лет', () => {
    expect(formatDuration(12_300 * YEAR)).toBe('12,3 тыс. лет')
    expect(formatDuration(1e6 * YEAR)).toBe('1 млн лет')
    expect(formatDuration(4.5e9 * YEAR)).toBe('4,5 млрд лет')
    expect(formatDuration(3e15 * YEAR)).toBe('3 × 10¹⁵ лет')
  })

  it('ноль, отрицательные и нечисловые значения', () => {
    expect(formatDuration(0)).toBe('0 секунд')
    expect(formatDuration(-90)).toBe('−1 минута 30 секунд')
    expect(formatDuration(NaN)).toBe('—')
  })
})
