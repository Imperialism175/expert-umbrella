import { useSyncExternalStore } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

function subscribe(onChange: () => void): () => void {
  if (typeof window.matchMedia !== 'function') return () => {}
  const media = window.matchMedia(QUERY)
  media.addEventListener('change', onChange)
  return () => media.removeEventListener('change', onChange)
}

/** Там, где настройку узнать нельзя, считаем, что движение нежелательно. */
function getSnapshot(): boolean {
  if (typeof window.matchMedia !== 'function') return true
  return window.matchMedia(QUERY).matches
}

/** Просит ли пользователь уменьшить движение на экране. */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, () => true)
}
