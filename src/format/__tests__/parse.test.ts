import { describe, expect, it } from 'vitest'
import { parseNumber, toInputText } from '../parse'

describe('parseNumber', () => {
  it('принимает запятую и точку как десятичный разделитель', () => {
    expect(parseNumber('4,3')).toBe(4.3)
    expect(parseNumber('4.3')).toBe(4.3)
    expect(parseNumber('.5')).toBe(0.5)
    expect(parseNumber('5.')).toBe(5)
  })

  it('игнорирует пробелы между разрядами', () => {
    expect(parseNumber(' 4 300 000 ')).toBe(4_300_000)
    expect(parseNumber('4 300 000')).toBe(4_300_000)
  })

  it('понимает научную запись', () => {
    expect(parseNumber('4,3e6')).toBe(4.3e6)
    expect(parseNumber('1E-9')).toBe(1e-9)
  })

  it('понимает знак, включая типографский минус', () => {
    expect(parseNumber('-2')).toBe(-2)
    expect(parseNumber('−2')).toBe(-2)
  })

  it('возвращает null для нечисел', () => {
    for (const text of ['', ' ', 'abc', '4,3e', '1,2,3', '1e999', '--1']) {
      expect(parseNumber(text)).toBeNull()
    }
  })
})

describe('toInputText', () => {
  it('пишет число так, чтобы его можно было ввести обратно', () => {
    expect(toInputText(4.3e6)).toBe('4300000')
    expect(toInputText(0.5)).toBe('0,5')
    expect(toInputText(8.55e36)).toBe('8,55e36')
    expect(toInputText(1e-9)).toBe('1e-9')
  })

  it('убирает шум округления', () => {
    expect(toInputText(0.1 + 0.2)).toBe('0,3')
  })

  it('результат разбирается обратно в то же число', () => {
    for (const value of [4.3e6, 0.5, 8.55e36, 1e-9, 8766]) {
      expect(parseNumber(toInputText(value))).toBe(value)
    }
  })
})
