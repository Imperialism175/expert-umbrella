import { StaticFallback } from '@/components/scene/StaticFallback'
import { ru } from '@/i18n/ru'

const panel = 'rounded-panel border border-line bg-panel p-6 backdrop-blur-md'

function App() {
  return (
    <div className="flex min-h-dvh flex-col lg:h-dvh lg:flex-row">
      <aside className="order-2 flex flex-col gap-6 p-4 sm:p-6 lg:order-1 lg:w-[420px] lg:shrink-0 lg:overflow-y-auto">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight">
            {ru.app.title}
          </h1>
          <p className="mt-2 text-sm text-ink-muted">{ru.app.subtitle}</p>
        </header>

        <section aria-labelledby="inputs-heading" className={panel}>
          <h2
            id="inputs-heading"
            className="text-xs font-medium tracking-widest text-ink-muted uppercase"
          >
            {ru.inputs.heading}
          </h2>
          <p className="mt-4 text-sm text-ink-muted">{ru.inputs.placeholder}</p>
        </section>

        <section aria-labelledby="result-heading" className={panel}>
          <h2
            id="result-heading"
            className="text-xs font-medium tracking-widest text-ink-muted uppercase"
          >
            {ru.result.heading}
          </h2>
          <p className="mt-3 font-mono text-lg text-hole">
            {ru.result.placeholder}
          </p>
        </section>
      </aside>

      <main className="relative order-1 h-[35dvh] min-h-64 lg:order-2 lg:h-auto lg:flex-1">
        <StaticFallback />
      </main>
    </div>
  )
}

export default App
