import { motion } from 'motion/react'
import { useCallback, useState, type Dispatch } from 'react'
import { ru } from '@/i18n/ru'
import type {
  CalculatorAction,
  CalculatorState,
} from '@/state/calculatorReducer'
import { ControlDeck } from './ControlDeck'
import { DepthGauge } from './DepthGauge'
import { entrance } from './entrance'
import { Readouts } from './Readouts'

type MobilePanel = 'deck' | 'telemetry'

interface HudProps {
  state: CalculatorState
  dispatch: Dispatch<CalculatorAction>
  /** Радиус Шварцшильда для введённой массы, м. */
  horizon: number | null
}

const toggleButton =
  'rounded-full border border-line bg-glass px-3 py-1 text-xs text-ink-muted backdrop-blur-md aria-pressed:border-hole aria-pressed:text-hole focus-visible:ring-2 focus-visible:ring-earth/50 focus-visible:outline-none'

/*
 * Интерфейс поверх сцены. Каждый блок закреплён у своего края экрана, центр
 * остаётся свободным для чёрной дыры. На широком экране пульт и телеметрия
 * видны всегда; на узком это шторки, которые открываются кнопками.
 */
export function Hud({ state, dispatch, horizon }: HudProps) {
  const [mobilePanel, setMobilePanel] = useState<MobilePanel | null>(null)
  const closePanel = useCallback(() => setMobilePanel(null), [])
  const toggle = (panel: MobilePanel) =>
    setMobilePanel((current) => (current === panel ? null : panel))

  return (
    <>
      <motion.header
        {...entrance(0)}
        className="pointer-events-none fixed top-4 left-4 z-20 xl:top-7 xl:left-6"
      >
        <h1 className="font-display text-base font-medium tracking-wide xl:text-xl">
          {ru.app.title}
        </h1>
        <p className="mt-1 hidden max-w-xs text-xs text-ink-muted xl:block">
          {ru.app.subtitle}
        </p>
      </motion.header>

      <div className="fixed top-11 left-4 z-20 flex gap-1.5 xl:hidden">
        <button
          type="button"
          aria-pressed={mobilePanel === 'deck'}
          onClick={() => toggle('deck')}
          className={toggleButton}
        >
          {ru.hud.deck}
        </button>
        <button
          type="button"
          aria-pressed={mobilePanel === 'telemetry'}
          onClick={() => toggle('telemetry')}
          className={toggleButton}
        >
          {ru.hud.telemetry}
        </button>
      </div>

      <ControlDeck
        state={state}
        dispatch={dispatch}
        horizon={horizon}
        open={mobilePanel === 'deck'}
        onClose={closePanel}
      />
      <Readouts
        state={state}
        telemetryOpen={mobilePanel === 'telemetry'}
        onClose={closePanel}
      />
      <DepthGauge mode={state.mode} />
    </>
  )
}
