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
  lengthToMeters,
  massToGravParam,
  metersToLength,
  secondsToTime,
  timeToSeconds,
  type LengthUnit,
  type MassUnit,
  type TimeUnit,
} from '@/physics/units'

export type FieldName = 'time' | 'mass' | 'distance'

/** В полях хранится введённый текст как есть — число из него получается при расчёте. */
export interface CalculatorState {
  time: { text: string; unit: TimeUnit }
  mass: { text: string; unit: MassUnit }
  distance: { text: string; unit: LengthUnit; from: DistanceOrigin }
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
  distance: { text: '1', unit: 'rs', from: 'horizon' },
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

export function toComputeInput(state: CalculatorState): ComputeInput {
  const value = (text: string) => parseNumber(text) ?? NaN
  return {
    time: { value: value(state.time.text), unit: state.time.unit },
    mass: { value: value(state.mass.text), unit: state.mass.unit },
    distance: {
      value: value(state.distance.text),
      unit: state.distance.unit,
      from: state.distance.from,
    },
    mode: state.mode,
    direction: state.direction,
  }
}

/** Пересчитывает текст поля; если пересчитать нельзя, оставляет его как есть. */
function convertText(
  text: string,
  convert: (value: number) => number | null,
): string {
  const value = parseNumber(text)
  if (value === null) return text
  const converted = convert(value)
  if (converted === null || !Number.isFinite(converted)) return text
  return toInputText(converted)
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

    case 'setDistanceUnit': {
      const { text, unit } = state.distance
      const rs = horizonRadius(state)
      const needsRs = unit === 'rs' || action.unit === 'rs'
      return {
        ...state,
        distance: {
          ...state.distance,
          unit: action.unit,
          text: convertText(text, (value) =>
            needsRs && rs === null
              ? null
              : metersToLength(
                  lengthToMeters(value, unit, rs ?? 1),
                  action.unit,
                  rs ?? 1,
                ),
          ),
        },
      }
    }

    // Смена точки отсчёта сохраняет положение объекта: 2 rs от центра = 1 rs от горизонта.
    case 'setOrigin': {
      if (action.from === state.distance.from) return state
      const { text, unit } = state.distance
      const rs = horizonRadius(state)
      const sign = action.from === 'horizon' ? -1 : 1
      return {
        ...state,
        distance: {
          unit,
          from: action.from,
          text: convertText(text, (value) => {
            if (rs === null) return null
            const shifted =
              unit === 'rs'
                ? value + sign
                : metersToLength(
                    lengthToMeters(value, unit, rs) + sign * rs,
                    unit,
                    rs,
                  )
            return shifted > 0 ? shifted : null
          }),
        },
      }
    }

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
