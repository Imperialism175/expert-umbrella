import { useFrame } from '@react-three/fiber'
import { useRef, useState } from 'react'
import { Vector2, type ShaderMaterial } from 'three'
import { useDescentStore } from '@/state/descentStore'
import { clampSceneHeight, sceneView } from './sceneView'
import fragmentShader from './shaders/blackHole.frag.glsl?raw'
import vertexShader from './shaders/fullscreen.vert.glsl?raw'

/** Число шагов луча и длина шага относительно расстояния до дыры. */
const QUALITY = { STEPS: 150, STEP_SCALE: '0.065' }
/** Скорость, с которой камера догоняет заданную высоту, 1/с. */
const FOLLOW_RATE = 3
function createUniforms() {
  return {
    uTime: { value: 0 },
    uResolution: { value: new Vector2(1, 1) },
    uRadius: { value: 2 },
    uLapse: { value: 0.5 },
    uHalfFov: { value: 1 },
    uTilt: { value: 0 },
  }
}
type Uniforms = ReturnType<typeof createUniforms>

/**
 * Полноэкранный квад, на котором шейдер рисует чёрную дыру. Высоту
 * наблюдателя читает из хранилища спуска на каждом кадре, минуя рендер React.
 */
export function BlackHole() {
  const [initialUniforms] = useState(createUniforms)
  const [reducedMotion] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const material = useRef<ShaderMaterial>(null)
  // Камера догоняет заданную высоту плавно, в логарифмической шкале:
  // так движение равномерно и вдали, и у самого горизонта.
  const smoothedLogHeight = useRef<number | null>(null)

  useFrame((state, delta) => {
    if (!material.current) return
    const uniforms = material.current.uniforms as Uniforms

    const target = Math.log10(
      clampSceneHeight(10 ** useDescentStore.getState().logHeight),
    )
    const current = smoothedLogHeight.current ?? target
    const blend = reducedMotion ? 1 : 1 - Math.exp(-delta * FOLLOW_RATE)
    smoothedLogHeight.current = current + (target - current) * blend

    const view = sceneView(10 ** smoothedLogHeight.current)
    uniforms.uRadius.value = view.radius
    uniforms.uLapse.value = view.lapse
    uniforms.uHalfFov.value = view.halfFov
    uniforms.uTilt.value = view.tilt
    if (!reducedMotion) uniforms.uTime.value = state.clock.elapsedTime
    state.gl.getDrawingBufferSize(uniforms.uResolution.value)
  })

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={material}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={initialUniforms}
        defines={QUALITY}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  )
}
