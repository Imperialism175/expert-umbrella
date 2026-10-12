import { useFrame } from '@react-three/fiber'
import { useRef, useState } from 'react'
import { Vector2, type ShaderMaterial } from 'three'
import { clampSceneHeight, sceneView } from './sceneView'
import fragmentShader from './shaders/blackHole.frag.glsl?raw'
import vertexShader from './shaders/fullscreen.vert.glsl?raw'

/** Число шагов луча и длина шага относительно расстояния до дыры. */
const QUALITY = { STEPS: 150, STEP_SCALE: '0.065' }
/** Скорость, с которой камера догоняет заданную высоту, 1/с. */
const FOLLOW_RATE = 3
/** Высота камеры, пока расчёта ещё нет, в rs. */
const INITIAL_HEIGHT = 1

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

interface BlackHoleProps {
  /** Высота наблюдателя над горизонтом, в rs; null — оставаться на месте. */
  heightInRs: number | null
}

/** Полноэкранный квад, на котором шейдер рисует чёрную дыру. */
export function BlackHole({ heightInRs }: BlackHoleProps) {
  const [initialUniforms] = useState(createUniforms)
  const [reducedMotion] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const material = useRef<ShaderMaterial>(null)
  // Высота сглаживается в логарифмической шкале: так движение равномерно
  // и вдали, и у самого горизонта.
  const flight = useRef<{ logHeight: number; target: number } | null>(null)

  useFrame((state, delta) => {
    if (!material.current) return
    const uniforms = material.current.uniforms as Uniforms

    const requested = Math.log10(clampSceneHeight(heightInRs ?? INITIAL_HEIGHT))
    flight.current ??= { logHeight: requested, target: requested }
    if (heightInRs !== null) flight.current.target = requested
    const blend = reducedMotion ? 1 : 1 - Math.exp(-delta * FOLLOW_RATE)
    flight.current.logHeight +=
      (flight.current.target - flight.current.logHeight) * blend

    const view = sceneView(10 ** flight.current.logHeight)
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
