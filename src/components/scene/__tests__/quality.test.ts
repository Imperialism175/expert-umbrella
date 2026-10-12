import { describe, expect, it } from 'vitest'
import { lowerTier, QUALITY, raiseTier } from '../quality'

describe('уровни качества', () => {
  it('понижаются и повышаются на одну ступень', () => {
    expect(lowerTier('high')).toBe('medium')
    expect(lowerTier('medium')).toBe('low')
    expect(raiseTier('low')).toBe('medium')
    expect(raiseTier('medium')).toBe('high')
  })

  it('упираются в крайние ступени', () => {
    expect(lowerTier('low')).toBe('low')
    expect(raiseTier('high')).toBe('high')
  })

  it('каждая ступень выше требует больше работы от видеокарты', () => {
    expect(QUALITY.low.steps).toBeLessThan(QUALITY.medium.steps)
    expect(QUALITY.medium.steps).toBeLessThan(QUALITY.high.steps)
    expect(QUALITY.low.maxDpr).toBeLessThan(QUALITY.high.maxDpr)
    expect(QUALITY.low.dust).toBeLessThan(QUALITY.high.dust)
    // Меньше шагов — длиннее каждый шаг, иначе луч не дойдёт до дыры.
    expect(Number(QUALITY.low.stepScale)).toBeGreaterThan(
      Number(QUALITY.high.stepScale),
    )
  })
})
