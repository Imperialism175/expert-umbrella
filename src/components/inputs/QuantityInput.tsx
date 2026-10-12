import { useId, useState, type ReactNode } from 'react'
import { ru } from '@/i18n/ru'

interface QuantityInputProps<U extends string> {
  label: string
  text: string
  unit: U
  units: Readonly<Record<U, string>>
  onTextChange: (text: string) => void
  onUnitChange: (unit: U) => void
  onFocusChange?: (focused: boolean) => void
  /** Показывается после первого ухода из поля, чтобы не мешать набору. */
  error?: string
  /** Показывать ошибку сразу, не дожидаясь ухода из поля. */
  errorImmediate?: boolean
  hint?: ReactNode
  /** Кнопка справа от подписи. */
  action?: ReactNode
  accent?: 'earth' | 'hole'
}

const accentText = { earth: 'text-earth', hole: 'text-hole' } as const

/** Числовое поле с выбором единицы измерения. */
export function QuantityInput<U extends string>({
  label,
  text,
  unit,
  units,
  onTextChange,
  onUnitChange,
  onFocusChange,
  error,
  errorImmediate,
  hint,
  action,
  accent,
}: QuantityInputProps<U>) {
  const id = useId()
  const [touched, setTouched] = useState(false)
  const shownError = touched || errorImmediate ? error : undefined
  const describedBy = shownError
    ? `${id}-error`
    : hint
      ? `${id}-hint`
      : undefined

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <label
          htmlFor={id}
          className={`text-sm font-medium ${accent ? accentText[accent] : ''}`}
        >
          {label}
        </label>
        {action}
      </div>

      <div
        className={`mt-2 flex rounded-xl border bg-white/[0.04] focus-within:ring-2 focus-within:ring-earth/50 ${
          shownError ? 'border-danger' : 'border-line'
        }`}
      >
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={text}
          onChange={(event) => onTextChange(event.target.value)}
          onFocus={() => onFocusChange?.(true)}
          onBlur={() => {
            setTouched(true)
            onFocusChange?.(false)
          }}
          aria-invalid={shownError ? true : undefined}
          aria-describedby={describedBy}
          className="min-w-0 flex-1 bg-transparent px-3 py-2.5 font-mono text-base outline-none"
        />
        <select
          value={unit}
          onChange={(event) => onUnitChange(event.target.value as U)}
          aria-label={`${ru.inputs.unitLabel}: ${label}`}
          className="max-w-[45%] rounded-r-xl border-l border-line bg-transparent px-2 text-sm text-ink-muted outline-none"
        >
          {(Object.keys(units) as U[]).map((key) => (
            <option key={key} value={key}>
              {units[key]}
            </option>
          ))}
        </select>
      </div>

      {shownError ? (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-danger">
          {shownError}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="mt-1.5 text-xs text-ink-muted">
            {hint}
          </p>
        )
      )}
    </div>
  )
}
