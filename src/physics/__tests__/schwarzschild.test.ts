import { describe, expect, it } from 'vitest'
import { AU, C, GM_EARTH, GM_SUN } from '../constants'
import {
  escapeVelocity,
  oneMinusSqrtOneMinus,
  orbitalPeriod,
  orbitalSpeed,
  orbitFactor,
  schwarzschildRadius,
  shadowAngularRadius,
  staticFactor,
} from '../schwarzschild'

describe('радиус Шварцшильда', () => {
  it('Солнце — около 2953 м', () => {
    expect(schwarzschildRadius(GM_SUN)).toBeCloseTo(2953.25, 1)
  })

  it('Земля — около 8,87 мм', () => {
    expect(schwarzschildRadius(GM_EARTH) * 1000).toBeCloseTo(8.87, 2)
  })

  it('Стрелец A* — около 0,085 а.е.', () => {
    expect(schwarzschildRadius(4.3e6 * GM_SUN) / AU).toBeCloseTo(0.0849, 4)
  })
})

describe('неподвижный наблюдатель', () => {
  const rs = 1000

  it('на r = 2 rs фактор равен √0,5', () => {
    expect(staticFactor(rs, rs)).toBeCloseTo(Math.SQRT1_2, 14)
  })

  it('на r = 4/3 rs фактор равен 0,5', () => {
    expect(staticFactor(rs / 3, rs)).toBeCloseTo(0.5, 14)
  })

  it('стремится к 1 вдали и к 0 у горизонта', () => {
    expect(staticFactor(1e30, rs)).toBe(1)
    expect(staticFactor(1e-30, rs)).toBeCloseTo(0, 12)
    expect(staticFactor(1e-30, rs)).toBeGreaterThan(0)
  })
})

describe('круговая орбита', () => {
  const rs = 1000

  it('на ISCO (r = 3 rs) фактор равен √0,5, скорость — c/2', () => {
    expect(orbitFactor(2 * rs, rs)).toBeCloseTo(Math.SQRT1_2, 14)
    expect(orbitalSpeed(2 * rs, rs)).toBeCloseTo(C / 2, 6)
  })

  it('на фотонной сфере (r = 1,5 rs) фактор равен 0, скорость — c', () => {
    expect(orbitFactor(rs / 2, rs)).toBe(0)
    expect(orbitalSpeed(rs / 2, rs)).toBeCloseTo(C, 6)
  })

  it('период Земли вокруг Солнца — около года', () => {
    const days = orbitalPeriod(GM_SUN, AU) / 86_400
    expect(days).toBeCloseTo(365.26, 1)
  })
})

describe('тень чёрной дыры', () => {
  const rs = 1000

  it('вдали угловой радиус тени — (√27/2)·rs/r', () => {
    expect(shadowAngularRadius(1e6 * rs, rs)).toBeCloseTo(
      Math.sqrt(27) / 2 / 1e6,
      10,
    )
  })

  it('на фотонной сфере тень занимает половину неба', () => {
    expect(shadowAngularRadius(rs / 2, rs)).toBeCloseTo(Math.PI / 2, 6)
  })

  it('у горизонта тень закрывает почти всё небо', () => {
    expect(shadowAngularRadius(1e-6 * rs, rs)).toBeCloseTo(Math.PI, 2)
  })

  it('растёт монотонно при спуске', () => {
    let previous = 0
    for (let exponent = 3; exponent >= -4; exponent -= 0.25) {
      const angle = shadowAngularRadius(10 ** exponent * rs, rs)
      expect(angle).toBeGreaterThan(previous)
      previous = angle
    }
  })
})

describe('вспомогательные формулы', () => {
  it('1 − √(1 − x) совпадает с прямой формулой при обычных x', () => {
    expect(oneMinusSqrtOneMinus(0.75)).toBeCloseTo(0.5, 14)
  })

  it('1 − √(1 − x) не обнуляется при x меньше машинного эпсилон', () => {
    expect(oneMinusSqrtOneMinus(1e-20)).toBeCloseTo(5e-21, 30)
    expect(1 - Math.sqrt(1 - 1e-20)).toBe(0)
  })

  it('скорость убегания на горизонте равна c', () => {
    expect(escapeVelocity(0, 1000)).toBe(C)
  })
})
