import { motion } from 'motion/react'
import { useMemo } from 'react'
import { DetailsGrid } from '@/components/results/DetailsGrid'
import { RegimeBadge } from '@/components/results/RegimeBadge'
import { ResultHero } from '@/components/results/ResultHero'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { ru } from '@/i18n/ru'
import { compute } from '@/physics/compute'
import { toComputeInput, type CalculatorState } from '@/state/calculatorReducer'
import { useDescentStore } from '@/state/descentStore'
import { entrance } from './entrance'
import { HudPanel } from './HudPanel'
import { TwinClocks } from './TwinClocks'

/** Сколько корабль должен простоять, чтобы итог считался окончательным, мс. */
const SETTLE_DELAY = 400

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
  // Пока корабль движется, итог меняется каждый кадр. aria-busy просит
  // скринридер дождаться остановки и объявить только конечное значение.
  const moving = useDebouncedValue(logHeight, SETTLE_DELAY) !== logHeight

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
          delay={0.25}
          onClose={onClose}
          className={`fixed z-20 p-4 max-xl:inset-x-3 max-xl:bottom-3 max-xl:z-30 max-xl:max-h-[70dvh] max-xl:overflow-y-auto max-xl:bg-deep/95 xl:top-20 xl:right-32 xl:w-64 ${
            telemetryOpen ? '' : 'max-xl:hidden'
          }`}
        >
          <DetailsGrid result={result} />
        </HudPanel>
      )}

      <motion.section
        {...entrance(0.35)}
        aria-labelledby="result-heading"
        className="hud-panel fixed inset-x-3 bottom-3 z-20 p-4 xl:inset-x-auto xl:bottom-6 xl:left-1/2 xl:w-[560px] xl:-translate-x-1/2"
      >
        <h2 id="result-heading" className="sr-only">
          {ru.result.heading}
        </h2>
        <TwinClocks factor={result?.factor ?? null} />
        <div
          aria-live="polite"
          aria-busy={moving}
          className="mt-3 border-t border-line pt-3"
        >
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
      </motion.section>
    </>
  )
}
