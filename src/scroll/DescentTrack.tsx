import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useRef } from 'react'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import {
  logHeightToProgress,
  progressToLogHeight,
  useDescentStore,
} from '@/state/descentStore'

gsap.registerPlugin(useGSAP)

/** Прокрутку ближе этого к заданной вручную точке не считаем жестом пользователя, px. */
const SEEK_TOLERANCE = 2

/**
 * Дорожка скролла: пустой высокий блок, прогресс прокрутки которого
 * задаёт глубину спуска. Сцена и интерфейс зафиксированы поверх него.
 */
export function DescentTrack() {
  const reducedMotion = usePrefersReducedMotion()
  const track = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (reducedMotion || !track.current) return
      // Регистрируется здесь, а не при загрузке модуля: ScrollTrigger сразу
      // обращается к браузерным API, которых нет в тестовом окружении.
      gsap.registerPlugin(ScrollTrigger)
      const { setFromScroll, registerScroller } = useDescentStore.getState()
      // Позиция, в которую страницу прокрутил ручной ввод: событие скролла
      // от неё не должно затирать точное введённое значение.
      let seekedTo: number | null = null

      const trigger = ScrollTrigger.create({
        trigger: track.current,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          if (
            seekedTo !== null &&
            Math.abs(self.scroll() - seekedTo) < SEEK_TOLERANCE
          ) {
            return
          }
          seekedTo = null
          setFromScroll(progressToLogHeight(self.progress))
        },
      })

      setFromScroll(progressToLogHeight(trigger.progress))
      registerScroller((logHeight) => {
        const position =
          trigger.start +
          logHeightToProgress(logHeight) * (trigger.end - trigger.start)
        seekedTo = position
        trigger.scroll(position)
      })

      return () => registerScroller(null)
    },
    { dependencies: [reducedMotion] },
  )

  if (reducedMotion) return null
  return (
    <div ref={track} aria-hidden className="pointer-events-none h-[700vh]" />
  )
}
