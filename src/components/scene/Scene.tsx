import { motion } from 'motion/react'
import { Component, lazy, Suspense, type ReactNode } from 'react'
import { ru } from '@/i18n/ru'
import { StaticFallback } from './StaticFallback'

const SpaceCanvas = lazy(() => import('./SpaceCanvas'))

const webglAvailable = typeof WebGL2RenderingContext !== 'undefined'

/** Если WebGL-сцена упала (нет контекста, ошибка шейдера), показываем запасную картинку. */
class SceneBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

/** Чёрная дыра: WebGL-сцена там, где она доступна, иначе статичная картинка. */
export function Scene() {
  if (!webglAvailable) return <StaticFallback />

  return (
    <SceneBoundary fallback={<StaticFallback />}>
      <Suspense fallback={<StaticFallback />}>
        <motion.div
          role="img"
          aria-label={ru.scene.label}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.4 }}
          className="h-full w-full"
        >
          <SpaceCanvas />
        </motion.div>
      </Suspense>
    </SceneBoundary>
  )
}
