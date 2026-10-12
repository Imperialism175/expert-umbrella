import { useState } from 'react'
import { QuantityInput } from '@/components/inputs/QuantityInput'
import { parseNumber, toInputText } from '@/format/parse'
import { ru } from '@/i18n/ru'
import type { DistanceOrigin } from '@/physics/compute'
import { LENGTH_UNITS, type LengthUnit } from '@/physics/units'
import { useDescentStore } from '@/state/descentStore'

/** Значащих цифр в поле, пока значение приходит от скролла. */
const DISPLAY_DIGITS = 4

interface DistanceFieldProps {
  unit: LengthUnit
  from: DistanceOrigin
  /** Радиус Шварцшильда для введённой массы, м; null, если масса некорректна. */
  horizon: number | null
  onUnitChange: (unit: LengthUnit) => void
}

type DistanceError = 'INVALID_INPUT' | 'AT_HORIZON' | 'INSIDE_HORIZON'

/**
 * Поле расстояния, связанное со спуском в обе стороны: при скролле показывает
 * текущую высоту, при вводе переносит корабль в указанную точку.
 */
export function DistanceField({
  unit,
  from,
  horizon,
  onUnitChange,
}: DistanceFieldProps) {
  const logHeight = useDescentStore((state) => state.logHeight)
  const seek = useDescentStore((state) => state.seek)
  // Пока поле в фокусе, показываем то, что печатает пользователь.
  const [draft, setDraft] = useState<string | null>(null)

  // Единиц измерения в одном радиусе Шварцшильда.
  const perRs =
    unit === 'rs' ? 1 : horizon === null ? null : horizon / LENGTH_UNITS[unit]
  const originOffset = from === 'center' ? 1 : 0

  const toHeight = (value: number) =>
    perRs === null ? null : value / perRs - originOffset

  // У горизонта отсчёт от центра даёт «1,000…», поэтому цифр нужно больше.
  const digits =
    DISPLAY_DIGITS +
    (from === 'center' ? Math.max(0, Math.ceil(-logHeight)) : 0)
  const shown =
    perRs === null
      ? ''
      : toInputText(
          Number(
            ((10 ** logHeight + originOffset) * perRs).toPrecision(digits),
          ),
        )

  let error: DistanceError | undefined
  if (draft !== null) {
    const value = parseNumber(draft)
    const height = value === null ? null : toHeight(value)
    if (value === null) error = 'INVALID_INPUT'
    else if (height !== null && height < 0) error = 'INSIDE_HORIZON'
    else if (height === 0) error = 'AT_HORIZON'
  }

  const handleText = (text: string) => {
    setDraft(text)
    const value = parseNumber(text)
    const height = value === null ? null : toHeight(value)
    if (height !== null && height > 0 && Number.isFinite(height)) {
      seek(Math.log10(height))
    }
  }

  return (
    <QuantityInput
      label={ru.inputs.distance.label}
      text={draft ?? shown}
      unit={unit}
      units={ru.units.length}
      onTextChange={handleText}
      onUnitChange={onUnitChange}
      onFocusChange={(focused) => setDraft(focused ? shown : null)}
      error={error && ru.fieldErrors[error]}
      errorImmediate={error !== 'INVALID_INPUT'}
      hint={unit === 'rs' && ru.inputs.distance.rsHint}
    />
  )
}
