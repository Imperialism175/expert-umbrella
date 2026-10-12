import { ru } from '@/i18n/ru'

/** Статичная CSS-чёрная дыра: каркас сцены и фолбэк на случай отсутствия WebGL. */
export function StaticFallback() {
  return (
    <div
      role="img"
      aria-label={ru.scene.label}
      className="relative flex h-full w-full items-center justify-center overflow-hidden"
    >
      <div
        className="absolute aspect-square w-[min(70%,32rem)] rounded-full opacity-80 blur-2xl"
        style={{
          background:
            'radial-gradient(circle, transparent 34%, var(--color-hole-deep) 42%, var(--color-hole) 50%, transparent 70%)',
        }}
      />
      <div
        className="absolute aspect-square w-[min(34%,16rem)] rounded-full"
        style={{
          background:
            'radial-gradient(circle, #000 62%, var(--color-hole) 66%, transparent 72%)',
        }}
      />
    </div>
  )
}
