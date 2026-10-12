import { parseNumber, toInputText } from '@/format/parse'
import type {
  ComputeInput,
  Direction,
  DistanceOrigin,
  ObjectMode,
} from '@/physics/compute'
import { DEFAULT_PRESET_ID, PRESETS } from '@/physics/presets'
import { schwarzschildRadius } from '@/physics/schwarzschild'
import {
  gravParamToMass,
  massToGravParam,
  secondsToTime,
  timeToSeconds,
  type LengthUnit,
  type MassUnit,
  type TimeUnit,
} from '@/physics/units'

export type FieldName = 'time' | 'mass'

/**
 * Состояние пульта. В числовых полях хранится введённый текст как есть —
 * число из него получается при расчёте. Само расстояние живёт в хранилище
 * спуска (descentStore); здесь — только то, в каком виде его показывать.
 */
export interface CalculatorState {
  time: { text: string; unit: TimeUnit }
  mass: { text: string; unit: MassUnit }
  distance: { unit: LengthUnit; from: DistanceOrigin }
  mode: ObjectMode
  direction: Direction
}

export type CalculatorAction =
  | { type: 'setText'; field: FieldName; text: string }
  | { type: 'setTimeUnit'; unit: TimeUnit }
  | { type: 'setMassUnit'; unit: MassUnit }
  | { type: 'setDistanceUnit'; unit: LengthUnit }
  | { type: 'setOrigin'; from: DistanceOrigin }
  | { type: 'setMode'; mode: ObjectMode }
  | { type: 'toggleDirection' }
  | { type: 'applyPreset'; solarMasses: number }

const defaultPreset = PRESETS.find((preset) => preset.id === DEFAULT_PRESET_ID)!

export const initialState: CalculatorState = {
  time: { text: '1', unit: 'yr' },
  mass: { text: toInputText(defaultPreset.solarMasses), unit: 'Msun' },
  distance: { unit: 'rs', from: 'horizon' },
  mode: 'static',
  direction: 'earthToHole',
}

/** Радиус Шварцшильда для введённой массы; null, если масса некорректна. */
export function horizonRadius(state: CalculatorState): number | null {
  const mass = parseNumber(state.mass.text)
  if (mass === null || mass <= 0) return null
  const rs = schwarzschildRadius(massToGravParam(mass, state.mass.unit))
  return Number.isFinite(rs) && rs > 0 ? rs : null
}

/**
 * Собирает вход для расчёта. Высота передаётся в радиусах Шварцшильда
 * от горизонта — в этом виде ядро считает без потери точности.
 */
export function toComputeInput(
  state: CalculatorState,
  heightInRs: number,
): ComputeInput {
  const value = (text: string) => parseNumber(text) ?? NaN
  return {
    time: { value: value(state.time.text), unit: state.time.unit },
    mass: { value: value(state.mass.text), unit: state.mass.unit },
    distance: { value: heightInRs, unit: 'rs', from: 'horizon' },
    mode: state.mode,
    direction: state.direction,
  }
}

/** Пересчитывает текст поля; если пересчитать нельзя, оставляет его как есть. */
function convertText(text: string, convert: (value: number) => number): string {
  const value = parseNumber(text)
  if (value === null) return text
  const converted = convert(value)
  return Number.isFinite(converted) ? toInputText(converted) : text
}

export function calculatorReducer(
  state: CalculatorState,
  action: CalculatorAction,
): CalculatorState {
  switch (action.type) {
    case 'setText':
      return {
        ...state,
        [action.field]: { ...state[action.field], text: action.text },
      }

    // Смена единицы сохраняет физическую величину: «1 год» → «8766 часов».
    case 'setTimeUnit': {
      const { text, unit } = state.time
      return {
        ...state,
        time: {
          unit: action.unit,
          text: convertText(text, (value) =>
            secondsToTime(timeToSeconds(value, unit), action.unit),
          ),
        },
      }
    }

    case 'setMassUnit': {
      const { text, unit } = state.mass
      return {
        ...state,
        mass: {
          unit: action.unit,
          text: convertText(text, (value) =>
            gravParamToMass(massToGravParam(value, unit), action.unit),
          ),
        },
      }
    }

    case 'setDistanceUnit':
      return { ...state, distance: { ...state.distance, unit: action.unit } }

    case 'setOrigin':
      return { ...state, distance: { ...state.distance, from: action.from } }

    case 'setMode':
      return { ...state, mode: action.mode }

    case 'toggleDirection':
      return {
        ...state,
        direction:
          state.direction === 'earthToHole' ? 'holeToEarth' : 'earthToHole',
      }

    case 'applyPreset':
      return {
        ...state,
        mass: { text: toInputText(action.solarMasses), unit: 'Msun' },
      }
  }
}
