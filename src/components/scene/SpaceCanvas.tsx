import { PerformanceMonitor } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { useEffect, useState } from 'react'
import { BlackHole } from './BlackHole'
import { Effects } from './Effects'
import { lowerTier, QUALITY, raiseTier, type QualityTier } from './quality'
import { StarDust } from './StarDust'

/** Границы частоты кадров, за которыми качество понижается или повышается. */
const FPS_BOUNDS: [number, number] = [45, 58]

/**
 * WebGL-холст сцены. Грузится отдельным чанком — см. Scene. Стартует на среднем
 * качестве и подстраивает его под фактическую частоту кадров.
 */
export default function SpaceCanvas() {
  const [tier, setTier] = useState<QualityTier>('medium')
  const quality = QUALITY[tier]

  // По этой метке CSS упрощает интерфейс: на низком качестве стеклянные
  // панели не размывают фон — размытие поверх WebGL дорого.
  useEffect(() => {
    document.documentElement.dataset.quality = tier
    return () => {
      delete document.documentElement.dataset.quality
    }
  }, [tier])

  return (
    <Canvas
      flat
      dpr={[1, quality.maxDpr]}
      gl={{ antialias: false, powerPreference: 'high-performance' }}
      aria-hidden
    >
      <PerformanceMonitor
        bounds={() => FPS_BOUNDS}
        flipflops={3}
        onDecline={() => setTier(lowerTier)}
        onIncline={() => setTier(raiseTier)}
        // Качество скачет туда-сюда — остаёмся на низком.
        onFallback={() => setTier('low')}
      />
      <BlackHole
        steps={quality.steps}
        stepScale={quality.stepScale}
        linearOutput={quality.postprocessing}
      />
      <StarDust count={quality.dust} />
      {quality.postprocessing && <Effects />}
    </Canvas>
  )
}
