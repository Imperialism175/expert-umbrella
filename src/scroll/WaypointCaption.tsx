import { AnimatePresence, motion } from 'motion/react'
import { ru } from '@/i18n/ru'
import { useDescentStore } from '@/state/descentStore'
import { activeWaypoint } from './waypoints'

/** Подпись к вехе спуска, рядом с которой сейчас находится корабль. */
export function WaypointCaption() {
  // Селектор возвращает идентификатор вехи, поэтому компонент
  // перерисовывается только при смене вехи, а не на каждый кадр скролла.
  const waypoint = useDescentStore((state) => activeWaypoint(state.logHeight))

  return (
    <div className="pointer-events-none fixed inset-x-0 top-32 z-10 flex justify-center px-10 xl:top-24">
      <AnimatePresence mode="wait">
        {waypoint && (
          <motion.p
            key={waypoint}
            initial={{ opacity: 0, y: 12, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -8, filter: 'blur(6px)' }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-md text-center font-display text-sm leading-relaxed text-ink text-shadow-lg sm:text-base"
          >
            {ru.waypoints[waypoint]}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
