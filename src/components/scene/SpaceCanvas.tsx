import { Canvas } from '@react-three/fiber'
import { BlackHole } from './BlackHole'

interface SpaceCanvasProps {
  heightInRs: number | null
}

/** WebGL-холст сцены. Грузится отдельным чанком — см. Scene. */
export default function SpaceCanvas({ heightInRs }: SpaceCanvasProps) {
  return (
    <Canvas
      flat
      dpr={[1, 1.5]}
      gl={{ antialias: false, powerPreference: 'high-performance' }}
      aria-hidden
    >
      <BlackHole heightInRs={heightInRs} />
    </Canvas>
  )
}
