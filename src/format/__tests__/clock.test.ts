import { describe, expect, it } from 'vitest'
import { formatClock } from '../clock'

describe('formatClock', () => {
  it('минуты, секунды и десятые', () => {
    expect(formatClock(0)).toBe('00:00.0')
    expect(formatClock(0.7071)).toBe('00:00.7')
    expect(formatClock(67.45)).toBe('01:07.4')
    expect(formatClock(599.99)).toBe('09:59.9')
  })

  it('после часа добавляет часы', () => {
    expect(formatClock(3667.4)).toBe('1:01:07.4')
  })

  it('отрицательное время показывает как ноль', () => {
    expect(formatClock(-5)).toBe('00:00.0')
  })
})
