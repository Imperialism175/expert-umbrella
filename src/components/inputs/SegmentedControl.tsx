import { useId } from 'react'

interface SegmentedControlProps<T extends string> {
  label: string
  value: T
  options: readonly { value: T; label: string }[]
  onChange: (value: T) => void
  /** Подпись видна только скринридерам. */
  hideLabel?: boolean
}

/** Переключатель из нескольких вариантов (группа радиокнопок). */
export function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
  hideLabel,
}: SegmentedControlProps<T>) {
  const name = useId()

  return (
    <fieldset>
      <legend className={hideLabel ? 'sr-only' : 'text-sm font-medium'}>
        {label}
      </legend>
      <div
        className={`grid grid-flow-col auto-cols-fr gap-1 rounded-xl border border-line bg-void-raised p-1 ${
          hideLabel ? '' : 'mt-2'
        }`}
      >
        {options.map((option) => (
          <label
            key={option.value}
            className="cursor-pointer rounded-lg px-2 py-1.5 text-center text-sm text-ink-muted transition-colors has-checked:bg-white/10 has-checked:text-ink has-focus-visible:ring-2 has-focus-visible:ring-earth/50"
          >
            <input
              type="radio"
              name={name}
              className="sr-only"
              checked={option.value === value}
              onChange={() => onChange(option.value)}
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  )
}
