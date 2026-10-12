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

function factor(state: CalculatorState, heightInRs: number): number {
  const outcome = compute(toComputeInput(state, heightInRs))
  if (!outcome.ok) throw new Error(outcome.error.code)
  return outcome.result.factor
}

describe('вход для расчёта', () => {
  it('высота передаётся в rs от горизонта', () => {
    expect(toComputeInput(initialState, 1).distance).toEqual({
      value: 1,
      unit: 'rs',
      from: 'horizon',
    })
    expect(factor(initialState, 1)).toBeCloseTo(Math.SQRT1_2, 12)
  })

  it('не зависит от того, в каком виде расстояние показано в поле', () => {
    const state = run([
      { type: 'setDistanceUnit', unit: 'km' },
      { type: 'setOrigin', from: 'center' },
    ])
    expect(factor(state, 1)).toBe(factor(initialState, 1))
  })
})

describe('ввод текста', () => {
  it('сохраняет текст как есть, даже некорректный', () => {
    const state = run([{ type: 'setText', field: 'mass', text: '4,3e' }])
    expect(state.mass.text).toBe('4,3e')
    expect(toComputeInput(state, 1).mass.value).toBeNaN()
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

  it('некорректный текст при смене единицы не трогается', () => {
    const state = run([
      { type: 'setText', field: 'time', text: 'abc' },
      { type: 'setTimeUnit', unit: 'd' },
    ])
    expect(state.time).toEqual({ text: 'abc', unit: 'd' })
  })
})

describe('остальные действия', () => {
  it('вид расстояния: единица и точка отсчёта', () => {
    const state = run([
      { type: 'setDistanceUnit', unit: 'ly' },
      { type: 'setOrigin', from: 'center' },
    ])
    expect(state.distance).toEqual({ unit: 'ly', from: 'center' })
  })

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
