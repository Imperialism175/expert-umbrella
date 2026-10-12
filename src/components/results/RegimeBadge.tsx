import { AnimatePresence, motion } from 'motion/react'
import { ru } from '@/i18n/ru'
import type { Regime, Warning } from '@/physics/compute'

const regimeStyle: Record<Regime, string> = {
  flat: 'border-earth/50 text-earth',
  weak: 'border-earth/50 text-earth',
  noticeable: 'border-hole/50 text-hole',
  extreme: 'border-danger/60 text-danger',
}

const chip =
  'rounded-full border bg-void/40 px-2.5 py-0.5 text-xs font-medium backdrop-blur-sm'

interface RegimeBadgeProps {
  regime: Regime
  warnings: readonly Warning[]
}

/** Режим замедления и предупреждения об опасностях. */
export function RegimeBadge({ regime, warnings }: RegimeBadgeProps) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      <li className={`${chip} transition-colors ${regimeStyle[regime]}`}>
        {ru.regime[regime]}
      </li>
      <AnimatePresence initial={false}>
        {warnings.map((warning) => (
          <motion.li
            key={warning}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className={`${chip} border-danger/60 text-danger`}
          >
            {ru.warnings[warning]}
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  )
}
