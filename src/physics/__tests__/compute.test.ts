import { describe, expect, it } from 'vitest'
import {
  compute,
  type ComputeInput,
  type ComputeResult,
  type ErrorCode,
} from '../compute'
import { C, YEAR } from '../constants'
import { DEFAULT_PRESET_ID, PRESETS } from '../presets'

const base: ComputeInput = {
  time: { value: 1, unit: 'yr' },
  mass: { value: 4.3e6, unit: 'Msun' },
  distance: { value: 2, unit: 'rs', from: 'center' },
  mode: 'static',
  direction: 'earthToHole',
}

function ok(overrides: Partial<ComputeInput> = {}): ComputeResult {
  const outcome = compute({ ...base, ...overrides })
  if (!outcome.ok) throw new Error(`Ожидался результат: ${outcome.error.code}`)
  return outcome.result
}

function errorCode(overrides: Partial<ComputeInput>): ErrorCode | null {
  const outcome = compute({ ...base, ...overrides })
  return outcome.ok ? null : outcome.error.code
}

/** Детерминированный генератор для property-тестов (mulberry32). */
function createRandom(seed: number): () => number {
  let state = seed
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

describe('неподвижный объект', () => {
  it('на r = 2 rs время идёт в √2 раз медленнее', () => {
    const result = ok()
    expect(result.factor).toBeCloseTo(Math.SQRT1_2, 12)
    expect(result.slowdown).toBeCloseTo(Math.SQRT2, 12)
    expect(result.earthTime).toBe(YEAR)
    expect(result.holeTime).toBeCloseTo(YEAR * Math.SQRT1_2, 3)
    expect(result.radiusInRs).toBeCloseTo(2, 12)
    expect(result.regime).toBe('noticeable')
  })

  it('на r = 4/3 rs фактор равен 0,5', () => {
    const result = ok({
      distance: { value: 4 / 3, unit: 'rs', from: 'center' },
    })
    expect(result.factor).toBeCloseTo(0.5, 12)
  })

  it('на r = 1,0001 rs фактор ≈ 0,0099995 — экстремальный режим', () => {
    const result = ok({
      distance: { value: 1.0001, unit: 'rs', from: 'center' },
    })
    expect(result.factor).toBeCloseTo(0.0099995, 7)
    expect(result.regime).toBe('extreme')
  })

  it('в 1 м над горизонтом Стрельца A* фактор конечен и точен', () => {
    const result = ok({ distance: { value: 1, unit: 'm', from: 'horizon' } })
    expect(result.heightAboveHorizon).toBe(1)
    expect(result.factor).toBeCloseTo(
      Math.sqrt(1 / result.schwarzschildRadius),
      12,
    )
    expect(result.factor).toBeGreaterThan(8.8e-6)
    expect(result.factor).toBeLessThan(8.95e-6)
  })

  it('отсчёт от центра и от горизонта дают один результат', () => {
    const fromCenter = ok({
      distance: { value: 3, unit: 'rs', from: 'center' },
    })
    const fromHorizon = ok({
      distance: { value: 2, unit: 'rs', from: 'horizon' },
    })
    expect(fromHorizon.factor).toBeCloseTo(fromCenter.factor, 14)
    expect(fromHorizon.radius).toBeCloseTo(fromCenter.radius, 3)
  })
})

describe('слабое поле', () => {
  it('на поверхности Солнца часы отстают примерно на 67 секунд в год', () => {
    const result = ok({
      mass: { value: 1, unit: 'Msun' },
      distance: { value: 695_700, unit: 'km', from: 'center' },
    })
    expect(result.deficit).toBeCloseTo(2.1225e-6, 9)
    expect(result.difference).toBeGreaterThan(66.5)
    expect(result.difference).toBeLessThan(67.5)
  })

  it('в световом годе от дыры в 10 M☉ разница — около 49 микросекунд в год', () => {
    const result = ok({
      mass: { value: 10, unit: 'Msun' },
      distance: { value: 1, unit: 'ly', from: 'center' },
    })
    expect(result.difference).toBeCloseTo(4.9255e-5, 8)
    expect(result.regime).toBe('flat')
  })

  it('разница не обнуляется, даже когда фактор неотличим от 1', () => {
    const result = ok({
      mass: { value: 10, unit: 'Msun' },
      distance: { value: 1e9, unit: 'ly', from: 'center' },
    })
    expect(result.factor).toBe(1)
    expect(result.difference).toBeGreaterThan(0)
    expect(result.deficit).toBeGreaterThan(0)
  })
})

describe('круговая орбита', () => {
  it('на r = 3 rs фактор √0,5, скорость c/2, орбита устойчива', () => {
    const result = ok({
      mode: 'orbit',
      distance: { value: 3, unit: 'rs', from: 'center' },
    })
    expect(result.factor).toBeCloseTo(Math.SQRT1_2, 12)
    expect(result.orbit?.speed).toBeCloseTo(C / 2, 3)
    expect(result.orbit?.stable).toBe(true)
    expect(result.warnings).toEqual([])
  })

  it('между 1,5 и 3 rs орбита неустойчива — предупреждение', () => {
    const result = ok({
      mode: 'orbit',
      distance: { value: 2, unit: 'rs', from: 'center' },
    })
    expect(result.orbit?.stable).toBe(false)
    expect(result.warnings).toContain('UNSTABLE_ORBIT')
  })

  it('на фотонной сфере и ниже круговых орбит нет', () => {
    for (const value of [1.5, 1.2]) {
      expect(
        errorCode({
          mode: 'orbit',
          distance: { value, unit: 'rs', from: 'center' },
        }),
      ).toBe('NO_CIRCULAR_ORBIT')
    }
  })

  it('для неподвижного объекта данных об орбите нет', () => {
    expect(ok().orbit).toBeNull()
  })
})

describe('обратный расчёт', () => {
  it('по времени у дыры находит земное', () => {
    const result = ok({ direction: 'holeToEarth' })
    expect(result.holeTime).toBe(YEAR)
    expect(result.earthTime).toBeCloseTo(YEAR * Math.SQRT2, 3)
    expect(result.difference).toBeCloseTo(YEAR * (Math.SQRT2 - 1), 3)
  })

  it('прямой и обратный расчёты взаимно обратны', () => {
    const random = createRandom(7)
    for (let i = 0; i < 200; i++) {
      const distance = {
        value: 10 ** (random() * 12 - 4),
        unit: 'rs',
        from: 'horizon',
      } as const
      const forward = ok({ distance })
      const back = ok({
        distance,
        direction: 'holeToEarth',
        time: { value: forward.holeTime, unit: 's' },
      })
      expect(back.earthTime / YEAR).toBeCloseTo(1, 12)
    }
  })
})

describe('производные величины', () => {
  it('на r = 2 rs: z = √2 − 1, скорость убегания c/√2', () => {
    const result = ok()
    expect(result.redshift).toBeCloseTo(Math.SQRT2 - 1, 12)
    expect(result.escapeVelocity / C).toBeCloseTo(Math.SQRT1_2, 12)
  })

  it('масса возвращается в килограммах', () => {
    const result = ok({ mass: { value: 1e30, unit: 'kg' } })
    expect(result.massKg / 1e30).toBeCloseTo(1, 12)
  })

  it('у дыры звёздной массы смертельны и приливы, и перегрузка', () => {
    const result = ok({ mass: { value: 21, unit: 'Msun' } })
    expect(result.warnings).toContain('LETHAL_TIDES')
    expect(result.warnings).toContain('LETHAL_ACCELERATION')
  })

  it('у сверхмассивной дыры приливы безопасны, но висеть на месте нельзя', () => {
    const result = ok()
    expect(result.warnings).not.toContain('LETHAL_TIDES')
    expect(result.warnings).toContain('LETHAL_ACCELERATION')
  })
})

describe('свойства', () => {
  it('фактор растёт с расстоянием и лежит между 0 и 1', () => {
    const random = createRandom(1)
    for (let i = 0; i < 300; i++) {
      const value = 10 ** (random() * 14 - 6)
      const near = ok({ distance: { value, unit: 'rs', from: 'horizon' } })
      const far = ok({
        distance: { value: value * 1.5, unit: 'rs', from: 'horizon' },
      })
      expect(near.factor).toBeGreaterThan(0)
      expect(far.factor).toBeLessThanOrEqual(1)
      expect(far.factor).toBeGreaterThanOrEqual(near.factor)
    }
  })

  it('на том же расстоянии в метрах большая масса замедляет сильнее', () => {
    const random = createRandom(2)
    for (let i = 0; i < 300; i++) {
      const solarMasses = 10 ** (random() * 9)
      const distance = { value: 1, unit: 'ly', from: 'center' } as const
      const light = ok({ mass: { value: solarMasses, unit: 'Msun' }, distance })
      const heavy = ok({
        mass: { value: solarMasses * 2, unit: 'Msun' },
        distance,
      })
      expect(heavy.deficit).toBeGreaterThan(light.deficit)
    }
  })

  it('в единицах rs результат не зависит от массы', () => {
    const light = ok({ mass: { value: 5, unit: 'Msun' } })
    const heavy = ok({ mass: { value: 5e9, unit: 'Msun' } })
    expect(heavy.factor).toBe(light.factor)
  })
})

describe('ошибки', () => {
  it('нечисловой ввод', () => {
    const outcome = compute({ ...base, time: { value: NaN, unit: 'yr' } })
    expect(outcome).toEqual({
      ok: false,
      error: { code: 'INVALID_INPUT', field: 'time' },
    })
    expect(errorCode({ mass: { value: Infinity, unit: 'Msun' } })).toBe(
      'INVALID_INPUT',
    )
  })

  it('неположительные значения', () => {
    expect(errorCode({ mass: { value: 0, unit: 'Msun' } })).toBe('NON_POSITIVE')
    expect(errorCode({ time: { value: -1, unit: 'yr' } })).toBe('NON_POSITIVE')
    expect(
      errorCode({ distance: { value: -1, unit: 'km', from: 'horizon' } }),
    ).toBe('NON_POSITIVE')
  })

  it('нулевое время допустимо', () => {
    expect(ok({ time: { value: 0, unit: 'yr' } }).holeTime).toBe(0)
  })

  it('на горизонте событий', () => {
    expect(
      errorCode({ distance: { value: 1, unit: 'rs', from: 'center' } }),
    ).toBe('AT_HORIZON')
    expect(
      errorCode({ distance: { value: 0, unit: 'km', from: 'horizon' } }),
    ).toBe('AT_HORIZON')
  })

  it('под горизонтом событий', () => {
    expect(
      errorCode({ distance: { value: 0.5, unit: 'rs', from: 'center' } }),
    ).toBe('INSIDE_HORIZON')
    expect(
      errorCode({ distance: { value: 1000, unit: 'km', from: 'center' } }),
    ).toBe('INSIDE_HORIZON')
  })

  it('переполнение', () => {
    expect(errorCode({ mass: { value: 1e300, unit: 'Msun' } })).toBe(
      'OUT_OF_RANGE',
    )
    expect(errorCode({ time: { value: 1e305, unit: 'Myr' } })).toBe(
      'OUT_OF_RANGE',
    )
  })

  it('ни один успешный результат не содержит NaN или Infinity', () => {
    const random = createRandom(3)
    for (let i = 0; i < 500; i++) {
      const outcome = compute({
        time: { value: 10 ** (random() * 20 - 10), unit: 'yr' },
        mass: { value: 10 ** (random() * 22 - 10), unit: 'Msun' },
        distance: {
          value: 10 ** (random() * 30 - 10),
          unit: 'km',
          from: random() < 0.5 ? 'center' : 'horizon',
        },
        mode: random() < 0.5 ? 'static' : 'orbit',
        direction: random() < 0.5 ? 'earthToHole' : 'holeToEarth',
      })
      if (!outcome.ok) continue
      const { orbit, warnings, regime, ...numbers } = outcome.result
      expect(regime).toBeTypeOf('string')
      expect(Array.isArray(warnings)).toBe(true)
      for (const value of [
        ...Object.values(numbers),
        ...(orbit ? [orbit.speed, orbit.period] : []),
      ]) {
        expect(Number.isFinite(value)).toBe(true)
      }
    }
  })
})

describe('пресеты', () => {
  it('каждый пресет даёт корректный расчёт', () => {
    for (const preset of PRESETS) {
      const result = ok({ mass: { value: preset.solarMasses, unit: 'Msun' } })
      expect(result.schwarzschildRadius).toBeGreaterThan(0)
    }
  })

  it('пресет по умолчанию есть в списке', () => {
    expect(PRESETS.some((preset) => preset.id === DEFAULT_PRESET_ID)).toBe(true)
  })
})
