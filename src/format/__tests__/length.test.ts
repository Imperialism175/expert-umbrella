import { describe, expect, it } from 'vitest'
import { AU, LIGHT_YEAR } from '@/physics/constants'
import { formatLength } from '../length'

describe('formatLength', () => {
  it('выбирает единицу по величине', () => {
    expect(formatLength(0.00887)).toBe('8,87 мм')
    expect(formatLength(12)).toBe('12 м')
    expect(formatLength(2953.25)).toBe('2,95 км')
    expect(formatLength(1.27e10)).toBe('12 700 000 км')
    expect(formatLength(5 * AU)).toBe('5 а.е.')
    expect(formatLength(0.5 * LIGHT_YEAR)).toBe('0,5 св. лет')
    expect(formatLength(2.5e6 * LIGHT_YEAR)).toBe('2 500 000 св. лет')
  })

  it('нечисловые значения', () => {
    expect(formatLength(NaN)).toBe('—')
  })
})
