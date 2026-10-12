import { useFrame } from '@react-three/fiber'
import {
  Bloom,
  ChromaticAberration,
  EffectComposer,
  Vignette,
} from '@react-three/postprocessing'
import type { ChromaticAberrationEffect } from 'postprocessing'
import { useRef } from 'react'
import { Vector2 } from 'three'
import { logHeightToProgress, useDescentStore } from '@/state/descentStore'

/** С этой доли спуска нарастает хроматическая аберрация — знак экстремального режима. */
const ABERRATION_FROM = 0.85
const ABERRATION_MAX = 0.0025

const NO_OFFSET = new Vector2(0, 0)

/** Постобработка: свечение диска, виньетка и аберрация у самого горизонта. */
export function Effects() {
  const aberration = useRef<ChromaticAberrationEffect>(null)

  useFrame(() => {
    const progress = logHeightToProgress(useDescentStore.getState().logHeight)
    const amount =
      Math.max(0, (progress - ABERRATION_FROM) / (1 - ABERRATION_FROM)) *
      ABERRATION_MAX
    aberration.current?.offset.set(amount, amount)
  })

  return (
    <EffectComposer multisampling={0}>
      {/* Порог высокий: светятся только диск и фотонное кольцо. */}
      <Bloom
        mipmapBlur
        luminanceThreshold={0.6}
        luminanceSmoothing={0.25}
        intensity={0.9}
      />
      <ChromaticAberration
        ref={aberration}
        offset={NO_OFFSET}
        radialModulation
        modulationOffset={0.35}
      />
      <Vignette offset={0.3} darkness={0.6} />
    </EffectComposer>
  )
}
