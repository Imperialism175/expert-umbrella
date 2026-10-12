import { create } from 'zustand'

/*
 * Глубина спуска — десятичный логарифм высоты над горизонтом в радиусах
 * Шварцшильда. Меняется до 60 раз в секунду при скролле, поэтому живёт вне
 * React-состояния: сцена читает её напрямую, а компоненты подписываются
 * узкими селекторами.
 */

/** Диапазон дорожки скролла: от 1000 rs до 0,0001 rs над горизонтом. */
export const MAX_LOG_HEIGHT = 3
export const MIN_LOG_HEIGHT = -4
/**
 * Начальная высота. Там, где работает спуск по скроллу, страница открывается
 * в начале дорожки — вдали от дыры. Без скролла (настройка «меньше движения»,
 * тестовое окружение) корабль сразу стоит в 1 rs над горизонтом.
 */
const scrollDriven =
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches
const DEFAULT_LOG_HEIGHT = scrollDriven ? MAX_LOG_HEIGHT : 0

export function logHeightToProgress(logHeight: number): number {
  const progress =
    (MAX_LOG_HEIGHT - logHeight) / (MAX_LOG_HEIGHT - MIN_LOG_HEIGHT)
  return Math.min(1, Math.max(0, progress))
}

export function progressToLogHeight(progress: number): number {
  return MAX_LOG_HEIGHT - progress * (MAX_LOG_HEIGHT - MIN_LOG_HEIGHT)
}

interface DescentState {
  logHeight: number
  /** Прокручивает страницу в точку, соответствующую глубине; null без дорожки скролла. */
  scroller: ((logHeight: number) => void) | null
  /** Глубина изменилась из-за скролла. */
  setFromScroll: (logHeight: number) => void
  /** Глубину задал пользователь (поле, шкала): значение точное, скролл подстраивается. */
  seek: (logHeight: number) => void
  registerScroller: (scroller: DescentState['scroller']) => void
}

export const useDescentStore = create<DescentState>()((set, get) => ({
  logHeight: DEFAULT_LOG_HEIGHT,
  scroller: null,
  setFromScroll: (logHeight) => set({ logHeight }),
  seek: (logHeight) => {
    set({ logHeight })
    get().scroller?.(logHeight)
  },
  registerScroller: (scroller) => set({ scroller }),
}))

export function resetDescentStore(): void {
  useDescentStore.setState({ logHeight: DEFAULT_LOG_HEIGHT, scroller: null })
}
