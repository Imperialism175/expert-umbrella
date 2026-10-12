import { InputPanel } from '@/components/inputs/InputPanel'
import { ResultPanel } from '@/components/results/ResultPanel'
import { StaticFallback } from '@/components/scene/StaticFallback'
import { useCalculator } from '@/hooks/useCalculator'
import { ru } from '@/i18n/ru'

/*
 * Раскладка — сетка. На телефоне блоки идут друг за другом: сцена, ввод,
 * результат. На десктопе ввод занимает левую колонку, сцена — всю правую,
 * а результат лежит поверх сцены внизу.
 */
function App() {
  const { state, dispatch, outcome, horizon } = useCalculator()

  return (
    <main className="grid min-h-dvh lg:h-dvh lg:grid-cols-[420px_1fr] lg:grid-rows-[1fr_auto]">
      <div className="h-[35dvh] min-h-56 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:h-auto lg:min-h-0">
        <StaticFallback />
      </div>

      <div className="flex flex-col gap-6 p-4 sm:p-6 lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:overflow-y-auto lg:border-r lg:border-line">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight">
            {ru.app.title}
          </h1>
          <p className="mt-2 text-sm text-ink-muted">{ru.app.subtitle}</p>
        </header>
        <InputPanel
          state={state}
          dispatch={dispatch}
          outcome={outcome}
          horizon={horizon}
        />
      </div>

      <div className="z-10 p-4 pt-0 sm:p-6 sm:pt-0 lg:col-start-2 lg:row-start-2 lg:max-h-dvh lg:self-end lg:overflow-y-auto lg:pt-6">
        <ResultPanel outcome={outcome} direction={state.direction} />
      </div>
    </main>
  )
}

export default App
