import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  type ShaderMaterial,
} from 'three'
import { useDescentStore } from '@/state/descentStore'
import { clampSceneHeight, sceneView } from './sceneView'
import fragmentShader from './shaders/starDust.frag.glsl?raw'
import vertexShader from './shaders/starDust.vert.glsl?raw'

/** Медленный дрейф пыли вдали от дыры и прибавка к нему на скорости света, доля области в секунду. */
const DRIFT = 0.015
const FLOW = 0.3

function createUniforms() {
  return {
    uOffset: { value: 0 },
    uTilt: { value: 0 },
    uAspect: { value: 1 },
    uSpeed: { value: 0 },
  }
}
type Uniforms = ReturnType<typeof createUniforms>

/** Детерминированный генератор: расположение пыли одинаково при каждом запуске. */
function createRandom(seed: number): () => number {
  let state = seed
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function createGeometry(count: number): BufferGeometry {
  const random = createRandom(42)
  const seeds = new Float32Array(count * 6)
  const ends = new Float32Array(count * 2)
  for (let i = 0; i < count; i++) {
    const point = [random(), random(), random()]
    seeds.set(point, i * 6)
    seeds.set(point, i * 6 + 3)
    ends[i * 2 + 1] = 1
  }
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(seeds, 3))
  geometry.setAttribute('aEnd', new BufferAttribute(ends, 1))
  return geometry
}

interface StarDustProps {
  count: number
}

/**
 * Звёздная пыль, текущая мимо корабля к дыре. Её скорость — √(rs/r) от
 * скорости света: так быстро зависший корабль видел бы свободно падающую пыль.
 */
export function StarDust({ count }: StarDustProps) {
  const [initialUniforms] = useState(createUniforms)
  const [reducedMotion] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const material = useRef<ShaderMaterial>(null)
  const geometry = useMemo(() => createGeometry(count), [count])

  useEffect(() => () => geometry.dispose(), [geometry])

  useFrame((state, delta) => {
    if (!material.current) return
    const uniforms = material.current.uniforms as Uniforms

    const view = sceneView(
      clampSceneHeight(10 ** useDescentStore.getState().logHeight),
    )
    const speed = Math.sqrt(1 / view.radius)
    uniforms.uSpeed.value = speed
    uniforms.uTilt.value = view.tilt
    uniforms.uAspect.value = state.size.width / state.size.height
    if (!reducedMotion) {
      uniforms.uOffset.value += delta * (DRIFT + FLOW * speed)
    }
  })

  return (
    <lineSegments geometry={geometry} frustumCulled={false} renderOrder={1}>
      <shaderMaterial
        ref={material}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={initialUniforms}
        blending={AdditiveBlending}
        transparent
        depthTest={false}
        depthWrite={false}
      />
    </lineSegments>
  )
}
