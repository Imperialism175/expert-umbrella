import { motion } from 'motion/react'
import type { KeyboardEvent, PointerEvent } from 'react'
import { formatNumber } from '@/format/number'
import { ru } from '@/i18n/ru'
import type { ObjectMode } from '@/physics/compute'
import { entrance } from './entrance'
import {
  logHeightToProgress,
  MAX_LOG_HEIGHT,
  MIN_LOG_HEIGHT,
  progressToLogHeight,
  useDescentStore,
} from '@/state/descentStore'

/** log₁₀ высоты фотонной сферы (r = 1,5 rs) над горизонтом. */
const PHOTON_SPHERE = Math.log10(0.5)

const MARKS: readonly { logHeight: number; label: string }[] = [
  { logHeight: MAX_LOG_HEIGHT, label: ru.gauge.far },
  { logHeight: Math.log10(2), label: ru.gauge.isco },
  { logHeight: PHOTON_SPHERE, label: ru.gauge.photonSphere },
  { logHeight: MIN_LOG_HEIGHT, label: ru.gauge.horizon },
]

const KEY_STEPS: Record<string, number> = {
  ArrowDown: -0.1,
  ArrowUp: 0.1,
  PageDown: -0.5,
  PageUp: 0.5,
}

const top = (logHeight: number) => `${logHeightToProgress(logHeight) * 100}%`

interface DepthGaugeProps {
  mode: ObjectMode
}

/**
 * Вертикальная логарифмическая шкала глубины: показывает, где корабль,
 * и позволяет перенести его щелчком, перетаскиванием или с клавиатуры.
 */
export function DepthGauge({ mode }: DepthGaugeProps) {
  const logHeight = useDescentStore((state) => state.logHeight)
  const seek = useDescentStore((state) => state.seek)

  const seekToPointer = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const progress = (event.clientY - rect.top) / rect.height
    seek(progressToLogHeight(Math.min(1, Math.max(0, progress))))
  }

  const handleKey = (event: KeyboardEvent<HTMLDivElement>) => {
    let next: number
    if (event.key === 'Home') next = MAX_LOG_HEIGHT
    else if (event.key === 'End') next = MIN_LOG_HEIGHT
    else if (event.key in KEY_STEPS) next = logHeight + KEY_STEPS[event.key]!
    else return
    event.preventDefault()
    seek(Math.min(MAX_LOG_HEIGHT, Math.max(MIN_LOG_HEIGHT, next)))
  }

  return (
    <motion.div
      {...entrance(0.45)}
      role="slider"
      tabIndex={0}
      aria-orientation="vertical"
      aria-label={ru.gauge.label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(logHeightToProgress(logHeight) * 100)}
      aria-valuetext={`${formatNumber(10 ** logHeight)} ${ru.gauge.aboveHorizon}`}
      onKeyDown={handleKey}
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId)
        seekToPointer(event)
      }}
      onPointerMove={(event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          seekToPointer(event)
        }
      }}
      className="fixed top-16 right-2 bottom-44 z-20 w-8 cursor-ns-resize touch-none rounded-md select-none focus-visible:ring-2 focus-visible:ring-earth/50 focus-visible:outline-none xl:top-8 xl:right-6 xl:bottom-8 xl:w-20"
    >
      <div className="absolute inset-y-0 right-2 w-px bg-line" />

      {mode === 'orbit' && (
        <div
          title={ru.gauge.noOrbits}
          className="absolute right-0.5 bottom-0 w-3.5 rounded-sm bg-danger/25"
          style={{ top: top(PHOTON_SPHERE) }}
        />
      )}

      {MARKS.map((mark) => (
        <div
          key={mark.label}
          className="absolute right-0 flex -translate-y-1/2 items-center gap-1.5"
          style={{ top: top(mark.logHeight) }}
        >
          <span className="hidden text-[10px] whitespace-nowrap text-ink-muted xl:block">
            {mark.label}
          </span>
          <span className="h-px w-4 bg-ink-muted/60" />
        </div>
      ))}

      <div
        className="absolute right-[3px] size-2.5 -translate-y-1/2 rotate-45 bg-hole shadow-[0_0_12px_var(--color-hole)]"
        style={{ top: top(logHeight) }}
      />
    </motion.div>
  )
}
