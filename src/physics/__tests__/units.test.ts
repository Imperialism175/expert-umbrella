import { describe, expect, it } from 'vitest'
import { AU, G, GM_SUN, LIGHT_YEAR, YEAR } from '../constants'
import {
  gravParamToMass,
  lengthToMeters,
  massToGravParam,
  metersToLength,
  secondsToTime,
  timeToSeconds,
} from '../units'

describe('единицы времени', () => {
  it('переводит в секунды', () => {
    expect(timeToSeconds(2, 'h')).toBe(7200)
    expect(timeToSeconds(1, 'yr')).toBe(YEAR)
    expect(timeToSeconds(1, 'Myr')).toBe(1e6 * YEAR)
  })

  it('обратный перевод возвращает исходное значение', () => {
    expect(secondsToTime(timeToSeconds(3.5, 'd'), 'd')).toBeCloseTo(3.5, 12)
  })
})

describe('единицы массы', () => {
  it('массы Солнца переводятся через GM☉, без участия G', () => {
    expect(massToGravParam(10, 'Msun')).toBe(10 * GM_SUN)
  })

  it('килограммы переводятся через G', () => {
    expect(massToGravParam(1e30, 'kg')).toBe(1e30 * G)
  })

  it('масса Солнца в килограммах ≈ 1,988 × 10³⁰', () => {
    const kg = gravParamToMass(massToGravParam(1, 'Msun'), 'kg')
    expect(kg / 1e30).toBeCloseTo(1.9884, 3)
  })
})

describe('единицы длины', () => {
  it('переводит в метры', () => {
    expect(lengthToMeters(1, 'km', 0)).toBe(1000)
    expect(lengthToMeters(1, 'au', 0)).toBe(AU)
    expect(lengthToMeters(2, 'ly', 0)).toBe(2 * LIGHT_YEAR)
  })

  it('радиусы Шварцшильда зависят от переданного rs', () => {
    expect(lengthToMeters(3, 'rs', 2953)).toBe(8859)
    expect(metersToLength(8859, 'rs', 2953)).toBe(3)
  })
})
