import { useMemo, useReducer } from 'react'
import {
  calculatorReducer,
  horizonRadius,
  initialState,
} from '@/state/calculatorReducer'

export function useCalculator() {
  const [state, dispatch] = useReducer(calculatorReducer, initialState)
  const horizon = useMemo(() => horizonRadius(state), [state])
  return { state, dispatch, horizon }
}
