import { useMemo } from 'react'
import { DetailsGrid } from '@/components/results/DetailsGrid'
import { RegimeBadge } from '@/components/results/RegimeBadge'
import { ResultHero } from '@/components/results/ResultHero'
import { ru } from '@/i18n/ru'
import { compute } from '@/physics/compute'
import { toComputeInput, type CalculatorState } from '@/state/calculatorReducer'
import { useDescentStore } from '@/state/descentStore'
import { HudPanel } from './HudPanel'
import { TwinClocks } from './TwinClocks'

interface ReadoutsProps {
  state: CalculatorState
  /** Открыта ли телеметрия на узком экране, где она работает как шторка. */
  telemetryOpen: boolean
  onClose: () => void
}

/**
 * Всё, что зависит от глубины спуска: режим, телеметрия, таймеры и итог.
 * Подписан на хранилище спуска и пересчитывает результат при скролле.
 */
export function Readouts({ state, telemetryOpen, onClose }: ReadoutsProps) {
  const logHeight = useDescentStore((store) => store.logHeight)
  const outcome = useMemo(
    () => compute(toComputeInput(state, 10 ** logHeight)),
    [state, logHeight],
  )
  const result = outcome.ok ? outcome.result : null

  return (
    <>
      {result && (
        <div className="fixed top-20 left-4 z-20 xl:top-8 xl:right-32 xl:left-auto">
          <RegimeBadge regime={result.regime} warnings={result.warnings} />
        </div>
      )}

      {result && (
        <HudPanel
          title={ru.hud.telemetry}
          onClose={onClose}
          className={`fixed z-20 p-4 max-xl:inset-x-3 max-xl:bottom-3 max-xl:z-30 max-xl:max-h-[70dvh] max-xl:overflow-y-auto max-xl:bg-deep/95 xl:top-20 xl:right-32 xl:w-64 ${
            telemetryOpen ? '' : 'max-xl:hidden'
          }`}
        >
          <DetailsGrid result={result} />
        </HudPanel>
      )}

      <section
        aria-labelledby="result-heading"
        className="hud-panel fixed inset-x-3 bottom-3 z-20 p-4 xl:inset-x-auto xl:bottom-6 xl:left-1/2 xl:w-[560px] xl:-translate-x-1/2"
      >
        <h2 id="result-heading" className="sr-only">
          {ru.result.heading}
        </h2>
        <TwinClocks factor={result?.factor ?? null} />
        <div aria-live="polite" className="mt-3 border-t border-line pt-3">
          {result ? (
            <ResultHero result={result} direction={state.direction} />
          ) : (
            !outcome.ok && (
              <p
                className={
                  outcome.error.code === 'INVALID_INPUT'
                    ? 'text-ink-muted'
                    : 'text-danger'
                }
              >
                {ru.errors[outcome.error.code]}
              </p>
            )
          )}
        </div>
      </section>
    </>
  )
}
