import { ru } from '@/i18n/ru'
import type { ComputeOutcome, Direction } from '@/physics/compute'
import { DetailsGrid } from './DetailsGrid'
import { RegimeBadge } from './RegimeBadge'
import { ResultHero } from './ResultHero'

interface ResultPanelProps {
  outcome: ComputeOutcome
  direction: Direction
}

/** Результат расчёта либо объяснение, почему его нет. */
export function ResultPanel({ outcome, direction }: ResultPanelProps) {
  return (
    <section
      aria-labelledby="result-heading"
      aria-live="polite"
      className="rounded-panel border border-line bg-void/70 p-5 backdrop-blur-md sm:p-6"
    >
      <h2 id="result-heading" className="sr-only">
        {ru.result.heading}
      </h2>

      {outcome.ok ? (
        <div className="flex flex-col gap-5">
          <RegimeBadge
            regime={outcome.result.regime}
            warnings={outcome.result.warnings}
          />
          <ResultHero result={outcome.result} direction={direction} />
          <div className="border-t border-line pt-4">
            <DetailsGrid result={outcome.result} />
          </div>
        </div>
      ) : (
        <p
          className={
            outcome.error.code === 'INVALID_INPUT'
              ? 'text-ink-muted'
              : 'text-danger'
          }
        >
          {ru.errors[outcome.error.code]}
        </p>
      )}
    </section>
  )
}
