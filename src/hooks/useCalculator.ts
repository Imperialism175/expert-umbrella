import { useMemo, useReducer } from 'react'
import { compute } from '@/physics/compute'
import {
  calculatorReducer,
  horizonRadius,
  initialState,
  toComputeInput,
} from '@/state/calculatorReducer'

export function useCalculator() {
  const [state, dispatch] = useReducer(calculatorReducer, initialState)
  const outcome = useMemo(() => compute(toComputeInput(state)), [state])
  const horizon = useMemo(() => horizonRadius(state), [state])
  return { state, dispatch, outcome, horizon }
}
