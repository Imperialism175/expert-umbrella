import { useId, type ReactNode } from 'react'
import { ru } from '@/i18n/ru'

interface HudPanelProps {
  title: string
  className?: string
  /** Кнопка закрытия; видна только на узких экранах, где панель — шторка. */
  onClose?: () => void
  children: ReactNode
}

/** Стеклянная панель пульта с ярлыком-заголовком и уголками. */
export function HudPanel({
  title,
  className = '',
  onClose,
  children,
}: HudPanelProps) {
  const headingId = useId()

  return (
    <section aria-labelledby={headingId} className={`hud-panel ${className}`}>
      <div className="mb-4 flex items-center gap-3">
        <h2 id={headingId} className="hud-label flex-1">
          {title}
        </h2>
        {onClose && (
          <button
            type="button"
            aria-label={ru.hud.close}
            onClick={onClose}
            className="rounded-md px-1.5 text-ink-muted hover:text-ink focus-visible:ring-2 focus-visible:ring-earth/50 focus-visible:outline-none xl:hidden"
          >
            ✕
          </button>
        )}
      </div>
      {children}
    </section>
  )
}
