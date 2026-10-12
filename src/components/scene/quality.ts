export type QualityTier = 'low' | 'medium' | 'high'

export interface QualitySettings {
  /** Максимум шагов трассировки луча. */
  steps: number
  /** Длина шага относительно расстояния до дыры (строка — подставляется в шейдер). */
  stepScale: string
  /** Предел плотности пикселей холста. */
  maxDpr: number
  /** Свечение, виньетка и аберрация. */
  postprocessing: boolean
  /** Число частиц звёздной пыли. */
  dust: number
}

export const QUALITY: Record<QualityTier, QualitySettings> = {
  low: {
    steps: 90,
    stepScale: '0.1',
    maxDpr: 1,
    postprocessing: false,
    dust: 600,
  },
  medium: {
    steps: 150,
    stepScale: '0.065',
    maxDpr: 1.5,
    postprocessing: true,
    dust: 1400,
  },
  high: {
    steps: 220,
    stepScale: '0.045',
    maxDpr: 2,
    postprocessing: true,
    dust: 2400,
  },
}

const ORDER: readonly QualityTier[] = ['low', 'medium', 'high']

const step = (tier: QualityTier, by: number): QualityTier =>
  ORDER[Math.min(ORDER.length - 1, Math.max(0, ORDER.indexOf(tier) + by))]!

export const lowerTier = (tier: QualityTier) => step(tier, -1)
export const raiseTier = (tier: QualityTier) => step(tier, 1)
