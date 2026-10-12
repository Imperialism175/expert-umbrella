import { Canvas } from '@react-three/fiber'
import { BlackHole } from './BlackHole'

/** WebGL-холст сцены. Грузится отдельным чанком — см. Scene. */
export default function SpaceCanvas() {
  return (
    <Canvas
      flat
      dpr={[1, 1.5]}
      gl={{ antialias: false, powerPreference: 'high-performance' }}
      aria-hidden
    >
      <BlackHole />
    </Canvas>
  )
}
