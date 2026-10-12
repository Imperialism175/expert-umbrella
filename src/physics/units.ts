import {
  AU,
  DAY,
  G,
  GM_EARTH,
  GM_SUN,
  HOUR,
  KILOMETER,
  LIGHT_YEAR,
  MINUTE,
  PARSEC,
  YEAR,
} from './constants'

/** Секунд в одной единице. */
export const TIME_UNITS = {
  s: 1,
  min: MINUTE,
  h: HOUR,
  d: DAY,
  yr: YEAR,
  kyr: 1e3 * YEAR,
  Myr: 1e6 * YEAR,
} as const
export type TimeUnit = keyof typeof TIME_UNITS

/** Гравитационный параметр GM (м³/с²) одной единицы массы. */
export const MASS_UNITS = {
  Msun: GM_SUN,
  kg: G,
  Mearth: GM_EARTH,
} as const
export type MassUnit = keyof typeof MASS_UNITS

/** Метров в одной единице. */
export const LENGTH_UNITS = {
  m: 1,
  km: KILOMETER,
  au: AU,
  ly: LIGHT_YEAR,
  pc: PARSEC,
} as const
/** 'rs' — радиусы Шварцшильда: единица зависит от массы чёрной дыры. */
export type LengthUnit = keyof typeof LENGTH_UNITS | 'rs'

export function timeToSeconds(value: number, unit: TimeUnit): number {
  return value * TIME_UNITS[unit]
}

export function secondsToTime(seconds: number, unit: TimeUnit): number {
  return seconds / TIME_UNITS[unit]
}

export function massToGravParam(value: number, unit: MassUnit): number {
  return value * MASS_UNITS[unit]
}

export function gravParamToMass(gravParam: number, unit: MassUnit): number {
  return gravParam / MASS_UNITS[unit]
}

export function lengthToMeters(
  value: number,
  unit: LengthUnit,
  schwarzschildRadius: number,
): number {
  return value * (unit === 'rs' ? schwarzschildRadius : LENGTH_UNITS[unit])
}

export function metersToLength(
  meters: number,
  unit: LengthUnit,
  schwarzschildRadius: number,
): number {
  return meters / (unit === 'rs' ? schwarzschildRadius : LENGTH_UNITS[unit])
}
