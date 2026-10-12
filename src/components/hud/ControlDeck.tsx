import { memo, type Dispatch } from 'react'
import { PresetChips } from '@/components/inputs/PresetChips'
import { QuantityInput } from '@/components/inputs/QuantityInput'
import { SegmentedControl } from '@/components/inputs/SegmentedControl'
import { formatLength } from '@/format/length'
import { parseNumber } from '@/format/parse'
import { ru } from '@/i18n/ru'
import type {
  CalculatorAction,
  CalculatorState,
} from '@/state/calculatorReducer'
import { DistanceField } from './DistanceField'
import { HudPanel } from './HudPanel'

interface ControlDeckProps {
  state: CalculatorState
  dispatch: Dispatch<CalculatorAction>
  /** Радиус Шварцшильда для введённой массы, м. */
  horizon: number | null
  /** Открыта ли панель на узком экране, где она работает как шторка. */
  open: boolean
  onClose: () => void
}

function numberError(text: string, allowZero: boolean): string | undefined {
  const value = parseNumber(text)
  if (value === null) return ru.fieldErrors.INVALID_INPUT
  if (value < 0 || (value === 0 && !allowZero)) {
    return ru.fieldErrors.NON_POSITIVE
  }
  return undefined
}

/**
 * Пульт: всё, что задаёт пользователь. Обёрнут в memo — при скролле
 * перерисовывается только поле расстояния, подписанное на глубину спуска.
 */
export const ControlDeck = memo(function ControlDeck({
  state,
  dispatch,
  horizon,
  open,
  onClose,
}: ControlDeckProps) {
  const earthIsKnown = state.direction === 'earthToHole'
  const solarMasses =
    state.mass.unit === 'Msun' ? parseNumber(state.mass.text) : null

  return (
    <HudPanel
      title={ru.hud.deck}
      onClose={onClose}
      className={`fixed z-20 overflow-x-hidden overflow-y-auto p-4 [scrollbar-width:thin] max-xl:inset-x-3 max-xl:bottom-3 max-xl:z-30 max-xl:max-h-[70dvh] max-xl:bg-deep/95 xl:top-24 xl:left-6 xl:max-h-[calc(100dvh-7.5rem)] xl:w-[340px] ${
        open ? '' : 'max-xl:hidden'
      }`}
    >
      <form
        className="flex flex-col gap-5"
        onSubmit={(event) => event.preventDefault()}
      >
        <div>
          <QuantityInput
            label={ru.inputs.mass.label}
            text={state.mass.text}
            unit={state.mass.unit}
            units={ru.units.mass}
            onTextChange={(text) =>
              dispatch({ type: 'setText', field: 'mass', text })
            }
            onUnitChange={(unit) => dispatch({ type: 'setMassUnit', unit })}
            error={numberError(state.mass.text, false)}
            hint={
              horizon !== null &&
              `${ru.inputs.mass.horizonHint} ${formatLength(horizon)}`
            }
          />
          <PresetChips
            solarMasses={solarMasses}
            onSelect={(value) =>
              dispatch({ type: 'applyPreset', solarMasses: value })
            }
          />
        </div>

        <div className="flex flex-col gap-2">
          <DistanceField
            unit={state.distance.unit}
            from={state.distance.from}
            horizon={horizon}
            onUnitChange={(unit) => dispatch({ type: 'setDistanceUnit', unit })}
          />
          <SegmentedControl
            hideLabel
            label={ru.inputs.distance.origin}
            value={state.distance.from}
            options={[
              { value: 'horizon', label: ru.inputs.distance.horizon },
              { value: 'center', label: ru.inputs.distance.center },
            ]}
            onChange={(from) => dispatch({ type: 'setOrigin', from })}
          />
        </div>

        <QuantityInput
          label={earthIsKnown ? ru.inputs.time.earth : ru.inputs.time.hole}
          accent={earthIsKnown ? 'earth' : 'hole'}
          text={state.time.text}
          unit={state.time.unit}
          units={ru.units.time}
          onTextChange={(text) =>
            dispatch({ type: 'setText', field: 'time', text })
          }
          onUnitChange={(unit) => dispatch({ type: 'setTimeUnit', unit })}
          error={numberError(state.time.text, true)}
          action={
            <button
              type="button"
              title={ru.inputs.time.swap}
              aria-label={ru.inputs.time.swap}
              onClick={() => dispatch({ type: 'toggleDirection' })}
              className="rounded-lg border border-line px-2 py-0.5 text-sm text-ink-muted transition-colors hover:text-ink focus-visible:ring-2 focus-visible:ring-earth/50 focus-visible:outline-none"
            >
              ⇄
            </button>
          }
        />

        <div>
          <SegmentedControl
            label={ru.inputs.mode.label}
            value={state.mode}
            options={[
              { value: 'static', label: ru.inputs.mode.static },
              { value: 'orbit', label: ru.inputs.mode.orbit },
            ]}
            onChange={(mode) => dispatch({ type: 'setMode', mode })}
          />
          <p className="mt-1.5 text-xs text-ink-muted">
            {state.mode === 'static'
              ? ru.inputs.mode.staticHint
              : ru.inputs.mode.orbitHint}
          </p>
        </div>
      </form>
    </HudPanel>
  )
})
