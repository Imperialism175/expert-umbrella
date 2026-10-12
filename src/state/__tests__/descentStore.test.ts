import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  logHeightToProgress,
  MAX_LOG_HEIGHT,
  MIN_LOG_HEIGHT,
  progressToLogHeight,
  resetDescentStore,
  useDescentStore,
} from '../descentStore'

beforeEach(resetDescentStore)

describe('перевод прогресса скролла в глубину', () => {
  it('начало дорожки — далеко, конец — у горизонта', () => {
    expect(progressToLogHeight(0)).toBe(MAX_LOG_HEIGHT)
    expect(progressToLogHeight(1)).toBe(MIN_LOG_HEIGHT)
  })

  it('фотонная сфера (0,5 rs над горизонтом) — на 47 % пути', () => {
    expect(logHeightToProgress(Math.log10(0.5))).toBeCloseTo(0.4716, 3)
  })

  it('преобразования взаимно обратны', () => {
    for (const progress of [0, 0.1, 0.5, 0.86, 1]) {
      expect(logHeightToProgress(progressToLogHeight(progress))).toBeCloseTo(
        progress,
        12,
      )
    }
  })

  it('глубина вне дорожки прижимается к её краям', () => {
    expect(logHeightToProgress(9)).toBe(0)
    expect(logHeightToProgress(-9)).toBe(1)
  })
})

describe('хранилище спуска', () => {
  it('скролл меняет глубину и не трогает прокрутку', () => {
    const scroller = vi.fn()
    useDescentStore.getState().registerScroller(scroller)

    useDescentStore.getState().setFromScroll(2)

    expect(useDescentStore.getState().logHeight).toBe(2)
    expect(scroller).not.toHaveBeenCalled()
  })

  it('ручной ввод сохраняет точное значение и подстраивает прокрутку', () => {
    const scroller = vi.fn()
    useDescentStore.getState().registerScroller(scroller)

    useDescentStore.getState().seek(-1.5)

    expect(useDescentStore.getState().logHeight).toBe(-1.5)
    expect(scroller).toHaveBeenCalledWith(-1.5)
  })

  it('без дорожки скролла ручной ввод просто меняет глубину', () => {
    useDescentStore.getState().seek(1)
    expect(useDescentStore.getState().logHeight).toBe(1)
  })
})
