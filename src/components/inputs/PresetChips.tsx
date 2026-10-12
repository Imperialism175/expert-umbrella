import { ru } from '@/i18n/ru'
import { PRESETS } from '@/physics/presets'

interface PresetChipsProps {
  /** Текущая масса в массах Солнца; null, если введена в других единицах или некорректна. */
  solarMasses: number | null
  onSelect: (solarMasses: number) => void
}

/** Кнопки с массами известных чёрных дыр. */
export function PresetChips({ solarMasses, onSelect }: PresetChipsProps) {
  return (
    <div
      role="group"
      aria-label={ru.inputs.mass.presets}
      className="mt-3 flex flex-wrap gap-1.5"
    >
      {PRESETS.map((preset) => {
        const { name, note } = ru.presets[preset.id]
        const active = solarMasses === preset.solarMasses
        return (
          <button
            key={preset.id}
            type="button"
            title={note}
            aria-pressed={active}
            onClick={() => onSelect(preset.solarMasses)}
            className={`rounded-full border px-2.5 py-1 text-xs transition-colors focus-visible:ring-2 focus-visible:ring-earth/50 focus-visible:outline-none ${
              active
                ? 'border-hole text-hole'
                : 'border-line text-ink-muted hover:text-ink'
            }`}
          >
            {name}
          </button>
        )
      })}
    </div>
  )
}
