import { describe, expect, it } from 'vitest'
import { formatNumber } from '../number'

describe('formatNumber', () => {
  it('обычные числа — с десятичной запятой', () => {
    expect(formatNumber(0.70710678)).toBe('0,707')
    expect(formatNumber(1.41421)).toBe('1,41')
    expect(formatNumber(2)).toBe('2')
  })

  it('большие числа — с неразрывными пробелами между разрядами', () => {
    expect(formatNumber(4.3e6)).toBe('4 300 000')
  })

  it('количество значащих цифр настраивается', () => {
    expect(formatNumber(0.0099995, 5)).toBe('0,0099995')
    expect(formatNumber(1234.5678, 6)).toBe('1 234,57')
  })

  it('очень большие и очень малые — в научной записи', () => {
    expect(formatNumber(6.5e9)).toBe('6,5 × 10⁹')
    expect(formatNumber(8.874e-6)).toBe('8,87 × 10⁻⁶')
    expect(formatNumber(1e30)).toBe('1 × 10³⁰')
    expect(formatNumber(4.2e-15)).toBe('4,2 × 10⁻¹⁵')
  })

  it('мантисса, округлившаяся до 10, переносится в порядок', () => {
    expect(formatNumber(9.999e11)).toBe('1 × 10¹²')
  })

  it('ноль, отрицательные и нечисловые значения', () => {
    expect(formatNumber(0)).toBe('0')
    expect(formatNumber(-2.5)).toBe('−2,5')
    expect(formatNumber(-3e12)).toBe('−3 × 10¹²')
    expect(formatNumber(NaN)).toBe('—')
    expect(formatNumber(Infinity)).toBe('—')
  })
})
