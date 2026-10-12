import type { Dispatch } from 'react'
import { formatLength } from '@/format/length'
import { parseNumber } from '@/format/parse'
import { ru } from '@/i18n/ru'
import type { ComputeOutcome, InputField } from '@/physics/compute'
import type {
  CalculatorAction,
  CalculatorState,
} from '@/state/calculatorReducer'
import { PresetChips } from './PresetChips'
import { QuantityInput } from './QuantityInput'
import { SegmentedControl } from './SegmentedControl'

interface InputPanelProps {
  state: CalculatorState
  dispatch: Dispatch<CalculatorAction>
  outcome: ComputeOutcome
  /** Радиус Шварцшильда для введённой массы, м. */
  horizon: number | null
}

export function InputPanel({
  state,
  dispatch,
  outcome,
  horizon,
}: InputPanelProps) {
  const fieldError = (field: InputField) =>
    !outcome.ok && outcome.error.field === field
      ? ru.fieldErrors[outcome.error.code]
      : undefined

  const earthIsKnown = state.direction === 'earthToHole'
  const solarMasses =
    state.mass.unit === 'Msun' ? parseNumber(state.mass.text) : null

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(event) => event.preventDefault()}
    >
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
        error={fieldError('time')}
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
        <QuantityInput
          label={ru.inputs.mass.label}
          text={state.mass.text}
          unit={state.mass.unit}
          units={ru.units.mass}
          onTextChange={(text) =>
            dispatch({ type: 'setText', field: 'mass', text })
          }
          onUnitChange={(unit) => dispatch({ type: 'setMassUnit', unit })}
          error={fieldError('mass')}
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
        <QuantityInput
          label={ru.inputs.distance.label}
          text={state.distance.text}
          unit={state.distance.unit}
          units={ru.units.length}
          onTextChange={(text) =>
            dispatch({ type: 'setText', field: 'distance', text })
          }
          onUnitChange={(unit) => dispatch({ type: 'setDistanceUnit', unit })}
          error={fieldError('distance')}
          hint={state.distance.unit === 'rs' && ru.inputs.distance.rsHint}
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
  )
}
