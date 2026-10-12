import { ru } from '@/i18n/ru'
import type { Regime, Warning } from '@/physics/compute'

const regimeStyle: Record<Regime, string> = {
  flat: 'border-earth/50 text-earth',
  noticeable: 'border-hole/50 text-hole',
  extreme: 'border-danger/60 text-danger',
}

const chip = 'rounded-full border px-2.5 py-0.5 text-xs font-medium'

interface RegimeBadgeProps {
  regime: Regime
  warnings: readonly Warning[]
}

/** Режим замедления и предупреждения об опасностях. */
export function RegimeBadge({ regime, warnings }: RegimeBadgeProps) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      <li className={`${chip} ${regimeStyle[regime]}`}>{ru.regime[regime]}</li>
      {warnings.map((warning) => (
        <li key={warning} className={`${chip} border-danger/60 text-danger`}>
          {ru.warnings[warning]}
        </li>
      ))}
    </ul>
  )
}
