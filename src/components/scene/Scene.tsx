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

interface SceneProps {
  /** Высота наблюдателя над горизонтом, в rs; null — если расчёта нет. */
  heightInRs: number | null
}

/** Чёрная дыра: WebGL-сцена там, где она доступна, иначе статичная картинка. */
export function Scene({ heightInRs }: SceneProps) {
  if (!webglAvailable) return <StaticFallback />

  return (
    <SceneBoundary fallback={<StaticFallback />}>
      <Suspense fallback={<StaticFallback />}>
        <div role="img" aria-label={ru.scene.label} className="h-full w-full">
          <SpaceCanvas heightInRs={heightInRs} />
        </div>
      </Suspense>
    </SceneBoundary>
  )
}
