const EASE = [0.22, 1, 0.36, 1] as const

/** Появление элемента пульта при загрузке: проявляется со сдвигом, с заданной задержкой. */
export function entrance(delay: number) {
  return {
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: EASE, delay },
  }
}
