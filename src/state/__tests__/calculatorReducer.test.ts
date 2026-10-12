import { describe, expect, it } from 'vitest'
import { compute } from '@/physics/compute'
import {
  calculatorReducer,
  horizonRadius,
  initialState,
  toComputeInput,
  type CalculatorAction,
  type CalculatorState,
} from '../calculatorReducer'

function run(
  actions: CalculatorAction[],
  state: CalculatorState = initialState,
): CalculatorState {
  return actions.reduce(calculatorReducer, state)
}

function factor(state: CalculatorState): number {
  const outcome = compute(toComputeInput(state))
  if (!outcome.ok) throw new Error(outcome.error.code)
  return outcome.result.factor
}

describe('начальное состояние', () => {
  it('даёт корректный расчёт: 1 rs над горизонтом Стрельца A*', () => {
    expect(factor(initialState)).toBeCloseTo(Math.SQRT1_2, 12)
  })
})

describe('ввод текста', () => {
  it('сохраняет текст как есть, даже некорректный', () => {
    const state = run([{ type: 'setText', field: 'mass', text: '4,3e' }])
    expect(state.mass.text).toBe('4,3e')
    expect(toComputeInput(state).mass.value).toBeNaN()
    expect(horizonRadius(state)).toBeNull()
  })
})

describe('смена единиц сохраняет физическую величину', () => {
  it('время: 1 год → 8766 часов', () => {
    const state = run([{ type: 'setTimeUnit', unit: 'h' }])
    expect(state.time).toEqual({ text: '8766', unit: 'h' })
  })

  it('масса: массы Солнца → килограммы и обратно', () => {
    const inKg = run([{ type: 'setMassUnit', unit: 'kg' }])
    expect(inKg.mass.unit).toBe('kg')
    expect(horizonRadius(inKg)).toBeCloseTo(horizonRadius(initialState)!, 0)

    const back = run([{ type: 'setMassUnit', unit: 'Msun' }], inKg)
    expect(back.mass.text).toBe('4300000')
  })

  it('расстояние: rs → км не меняет результат', () => {
    const state = run([{ type: 'setDistanceUnit', unit: 'km' }])
    expect(state.distance.unit).toBe('km')
    expect(factor(state)).toBeCloseTo(factor(initialState), 8)
  })

  it('некорректный текст при смене единицы не трогается', () => {
    const state = run([
      { type: 'setText', field: 'time', text: 'abc' },
      { type: 'setTimeUnit', unit: 'd' },
    ])
    expect(state.time).toEqual({ text: 'abc', unit: 'd' })
  })

  it('расстояние в rs нельзя пересчитать без массы — текст остаётся', () => {
    const state = run([
      { type: 'setText', field: 'mass', text: '' },
      { type: 'setDistanceUnit', unit: 'km' },
    ])
    expect(state.distance).toMatchObject({ text: '1', unit: 'km' })
  })
})

describe('точка отсчёта', () => {
  it('переключение сохраняет положение объекта', () => {
    const fromCenter = run([{ type: 'setOrigin', from: 'center' }])
    expect(fromCenter.distance).toMatchObject({ text: '2', from: 'center' })
    expect(factor(fromCenter)).toBeCloseTo(factor(initialState), 12)

    const back = run([{ type: 'setOrigin', from: 'horizon' }], fromCenter)
    expect(back.distance).toMatchObject({ text: '1', from: 'horizon' })
  })

  it('работает и в абсолютных единицах', () => {
    const state = run([
      { type: 'setDistanceUnit', unit: 'km' },
      { type: 'setOrigin', from: 'center' },
    ])
    expect(factor(state)).toBeCloseTo(factor(initialState), 8)
  })

  it('точку под горизонтом не пересчитывает', () => {
    const state = run([
      { type: 'setOrigin', from: 'center' },
      { type: 'setText', field: 'distance', text: '0,5' },
      { type: 'setOrigin', from: 'horizon' },
    ])
    expect(state.distance).toMatchObject({ text: '0,5', from: 'horizon' })
  })

  it('повторный выбор той же точки ничего не меняет', () => {
    expect(run([{ type: 'setOrigin', from: 'horizon' }])).toBe(initialState)
  })
})

describe('остальные действия', () => {
  it('пресет задаёт массу в массах Солнца', () => {
    const state = run([
      { type: 'setMassUnit', unit: 'kg' },
      { type: 'applyPreset', solarMasses: 21 },
    ])
    expect(state.mass).toEqual({ text: '21', unit: 'Msun' })
  })

  it('режим объекта', () => {
    expect(run([{ type: 'setMode', mode: 'orbit' }]).mode).toBe('orbit')
  })

  it('направление расчёта переключается туда и обратно', () => {
    const toggled = run([{ type: 'toggleDirection' }])
    expect(toggled.direction).toBe('holeToEarth')
    expect(run([{ type: 'toggleDirection' }], toggled).direction).toBe(
      'earthToHole',
    )
  })
})
