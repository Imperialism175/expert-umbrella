import { G, STANDARD_GRAVITY } from './constants'
import {
  escapeVelocity,
  hoverAcceleration,
  oneMinusSqrtOneMinus,
  orbitalPeriod,
  orbitalSpeed,
  orbitFactor,
  schwarzschildRadius,
  staticFactor,
  tidalGradient,
} from './schwarzschild'
import {
  lengthToMeters,
  massToGravParam,
  timeToSeconds,
  type LengthUnit,
  type MassUnit,
  type TimeUnit,
} from './units'

export type ObjectMode = 'static' | 'orbit'
export type DistanceOrigin = 'center' | 'horizon'
/** Какое время известно: на Земле (ищем время у дыры) или у дыры (ищем земное). */
export type Direction = 'earthToHole' | 'holeToEarth'

export interface ComputeInput {
  time: { value: number; unit: TimeUnit }
  mass: { value: number; unit: MassUnit }
  distance: { value: number; unit: LengthUnit; from: DistanceOrigin }
  mode: ObjectMode
  direction: Direction
}

export type Regime = 'flat' | 'weak' | 'noticeable' | 'extreme'
export type Warning = 'UNSTABLE_ORBIT' | 'LETHAL_TIDES' | 'LETHAL_ACCELERATION'

export interface ComputeResult {
  /** Радиус Шварцшильда, м. */
  schwarzschildRadius: number
  /** Масса, кг. */
  massKg: number
  /** Радиальная координата объекта, м. */
  radius: number
  /** Высота над горизонтом, м. */
  heightAboveHorizon: number
  radiusInRs: number

  /** dτ/dt: во сколько раз время у дыры идёт медленнее — это 1/factor. */
  factor: number
  slowdown: number
  /** 1 − factor, вычислено без вычитания (точно и вдали от дыры). */
  deficit: number
  earthTime: number
  holeTime: number
  /** earthTime − holeTime, вычислено без вычитания. */
  difference: number

  /** Гравитационное красное смещение z для света, испущенного с этого радиуса. */
  redshift: number
  escapeVelocity: number
  /** Ускорение для зависания на месте, м/с². На орбите объект в невесомости. */
  hoverAcceleration: number
  /** Приливный градиент, с⁻². */
  tidalGradient: number
  orbit: { speed: number; period: number; stable: boolean } | null

  regime: Regime
  warnings: Warning[]
}

export type ErrorCode =
  | 'INVALID_INPUT'
  | 'NON_POSITIVE'
  | 'AT_HORIZON'
  | 'INSIDE_HORIZON'
  | 'NO_CIRCULAR_ORBIT'
  | 'OUT_OF_RANGE'
export type InputField = 'time' | 'mass' | 'distance'

export interface PhysicsError {
  code: ErrorCode
  field?: InputField
}

export type ComputeOutcome =
  { ok: true; result: ComputeResult } | { ok: false; error: PhysicsError }

/** Ниже этого отличия factor от 1 пространство считаем почти плоским. */
export const FLAT_DEFICIT = 1e-9
/** Ниже этого отличия замедление слабое: «в 1 раз медленнее» после округления. */
export const WEAK_DEFICIT = 0.005
/** Ниже этого factor замедление считаем экстремальным. */
export const EXTREME_FACTOR = 0.01
/** Грубые пороги опасности для человека. */
export const LETHAL_ACCELERATION = 10 * STANDARD_GRAVITY
export const BODY_LENGTH = 2

function fail(code: ErrorCode, field?: InputField): ComputeOutcome {
  return { ok: false, error: field ? { code, field } : { code } }
}

export function compute(input: ComputeInput): ComputeOutcome {
  const { time, mass, distance, mode, direction } = input

  if (!Number.isFinite(time.value)) return fail('INVALID_INPUT', 'time')
  if (!Number.isFinite(mass.value)) return fail('INVALID_INPUT', 'mass')
  if (!Number.isFinite(distance.value)) return fail('INVALID_INPUT', 'distance')
  if (time.value < 0) return fail('NON_POSITIVE', 'time')
  if (mass.value <= 0) return fail('NON_POSITIVE', 'mass')
  if (distance.value < 0) return fail('NON_POSITIVE', 'distance')

  const gravParam = massToGravParam(mass.value, mass.unit)
  const rs = schwarzschildRadius(gravParam)
  if (!Number.isFinite(rs) || rs <= 0) return fail('OUT_OF_RANGE', 'mass')

  const knownTime = timeToSeconds(time.value, time.unit)
  if (!Number.isFinite(knownTime)) return fail('OUT_OF_RANGE', 'time')

  const entered = lengthToMeters(distance.value, distance.unit, rs)
  let h: number
  let r: number
  if (distance.from === 'horizon') {
    h = entered
    r = h + rs
  } else {
    r = entered
    // В единицах rs вычитание (value − 1) точное, в метрах — нет.
    h = distance.unit === 'rs' ? (distance.value - 1) * rs : r - rs
  }
  if (!Number.isFinite(h) || !Number.isFinite(r)) {
    return fail('OUT_OF_RANGE', 'distance')
  }
  if (h < 0) return fail('INSIDE_HORIZON', 'distance')
  if (h === 0) return fail('AT_HORIZON', 'distance')
  if (mode === 'orbit' && 2 * h <= rs) {
    return fail('NO_CIRCULAR_ORBIT', 'distance')
  }

  const x = rs / r
  const factor = mode === 'orbit' ? orbitFactor(h, rs) : staticFactor(h, rs)
  const deficit = oneMinusSqrtOneMinus(mode === 'orbit' ? 1.5 * x : x)
  if (!(factor > 0)) return fail('OUT_OF_RANGE', 'distance')

  const earthTime = direction === 'earthToHole' ? knownTime : knownTime / factor
  const holeTime = direction === 'earthToHole' ? knownTime * factor : knownTime
  const difference = earthTime * deficit
  if (!Number.isFinite(earthTime)) return fail('OUT_OF_RANGE', 'time')

  const hover = hoverAcceleration(gravParam, h, rs)
  const tidal = tidalGradient(gravParam, r)
  const stable = h >= 2 * rs

  const warnings: Warning[] = []
  if (mode === 'orbit' && !stable) warnings.push('UNSTABLE_ORBIT')
  if (tidal * BODY_LENGTH > LETHAL_ACCELERATION) warnings.push('LETHAL_TIDES')
  if (mode === 'static' && hover > LETHAL_ACCELERATION) {
    warnings.push('LETHAL_ACCELERATION')
  }

  let regime: Regime = 'noticeable'
  if (deficit < FLAT_DEFICIT) regime = 'flat'
  else if (deficit < WEAK_DEFICIT) regime = 'weak'
  else if (factor < EXTREME_FACTOR) regime = 'extreme'

  return {
    ok: true,
    result: {
      schwarzschildRadius: rs,
      massKg: gravParam / G,
      radius: r,
      heightAboveHorizon: h,
      radiusInRs: r / rs,
      factor,
      slowdown: 1 / factor,
      deficit,
      earthTime,
      holeTime,
      difference,
      redshift: oneMinusSqrtOneMinus(x) / staticFactor(h, rs),
      escapeVelocity: escapeVelocity(h, rs),
      hoverAcceleration: hover,
      tidalGradient: tidal,
      orbit:
        mode === 'orbit'
          ? {
              speed: orbitalSpeed(h, rs),
              period: orbitalPeriod(gravParam, r),
              stable,
            }
          : null,
      regime,
      warnings,
    },
  }
}
