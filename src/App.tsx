import { MotionConfig } from 'motion/react'
import { Hud } from '@/components/hud/Hud'
import { Scene } from '@/components/scene/Scene'
import { useCalculator } from '@/hooks/useCalculator'
import { DescentTrack } from '@/scroll/DescentTrack'
import { WaypointCaption } from '@/scroll/WaypointCaption'

/*
 * Страница — спуск корабля к чёрной дыре. Сцена и интерфейс закреплены на
 * экране, а прокручивается только невидимая дорожка: её прогресс задаёт
 * высоту корабля над горизонтом.
 */
function App() {
  const { state, dispatch, horizon } = useCalculator()

  return (
    // reducedMotion="user": при системной настройке «меньше движения»
    // анимации интерфейса сводятся к простому проявлению.
    <MotionConfig reducedMotion="user">
      <div className="fixed inset-0 z-0">
        <Scene />
      </div>
      <DescentTrack />
      <WaypointCaption />
      <main>
        <Hud state={state} dispatch={dispatch} horizon={horizon} />
      </main>
    </MotionConfig>
  )
}

export default App
