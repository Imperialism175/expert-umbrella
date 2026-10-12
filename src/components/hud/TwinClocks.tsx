import { useEffect, useRef } from 'react'
import { formatClock } from '@/format/clock'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { ru } from '@/i18n/ru'

/** После часа таймеры начинают заново, чтобы показания оставались короткими. */
const RESTART_AFTER = 3600
/** Вкладка была скрыта: такой скачок времени не засчитываем, с. */
const MAX_FRAME = 0.25

interface TwinClocksProps {
  /** Темп времени корабля dτ/dt; null — расчёта нет, таймеры стоят. */
  factor: number | null
}

/**
 * Два таймера, идущих одновременно: земной — в реальном времени, корабельный —
 * в factor раз медленнее. Цифры пишутся прямо в DOM, минуя рендер React.
 * Украшение: те же сведения есть текстом в итоге расчёта.
 */
export function TwinClocks({ factor }: TwinClocksProps) {
  const reducedMotion = usePrefersReducedMotion()
  const earthRef = useRef<HTMLSpanElement>(null)
  const shipRef = useRef<HTMLSpanElement>(null)
  const factorRef = useRef(factor)

  useEffect(() => {
    factorRef.current = factor
  }, [factor])

  useEffect(() => {
    if (reducedMotion) return
    let frame = 0
    let last = performance.now()
    let earth = 0
    let ship = 0

    const tick = (now: number) => {
      const delta = Math.min((now - last) / 1000, MAX_FRAME)
      last = now
      const rate = factorRef.current
      if (rate !== null) {
        earth += delta
        ship += delta * rate
        if (earth >= RESTART_AFTER) earth = ship = 0
      }
      if (earthRef.current) earthRef.current.textContent = formatClock(earth)
      if (shipRef.current) shipRef.current.textContent = formatClock(ship)
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [reducedMotion])

  // Без анимации показываем неподвижный кадр: одна земная секунда и её доля у корабля.
  return (
    <div aria-hidden className="grid grid-cols-2 gap-4 font-mono tabular-nums">
      <div>
        <p className="hud-label">{ru.clocks.earth}</p>
        <span
          ref={earthRef}
          className="glow-earth mt-1 block text-2xl text-earth sm:text-4xl"
        >
          {formatClock(1)}
        </span>
      </div>
      <div>
        <p className="hud-label">{ru.clocks.ship}</p>
        <span
          ref={shipRef}
          className="glow-hole mt-1 block text-2xl text-hole sm:text-4xl"
        >
          {formatClock(factor ?? 0)}
        </span>
      </div>
    </div>
  )
}
