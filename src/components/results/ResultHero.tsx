import { formatDuration, pluralize } from '@/format/duration'
import { formatNumber } from '@/format/number'
import { ru } from '@/i18n/ru'
import type { ComputeResult, Direction } from '@/physics/compute'

interface ResultHeroProps {
  result: ComputeResult
  direction: Direction
}

function slowdownText(slowdown: number): string {
  const text = formatNumber(slowdown)
  const rounded = Number(slowdown.toPrecision(3))
  // Дробное число требует формы «раза»: «в 1,41 раза», но «в 100 раз».
  const word = Number.isInteger(rounded)
    ? pluralize(rounded, ru.result.times)
    : ru.result.times[1]
  return `${text} ${word}`
}

/** Главная фраза результата: сколько времени прошло на Земле и у чёрной дыры. */
export function ResultHero({ result, direction }: ResultHeroProps) {
  const earth = (
    <strong className="font-mono font-semibold text-earth">
      {formatDuration(result.earthTime)}
    </strong>
  )
  const hole = (
    <strong className="font-mono font-semibold text-hole">
      {formatDuration(result.holeTime)}
    </strong>
  )
  const difference = formatDuration(result.difference)

  return (
    <div>
      <p className="text-lg leading-snug sm:text-xl">
        {direction === 'earthToHole' ? (
          <>
            {ru.result.whileEarth} {earth},<br />
            {ru.result.atHole}{' '}
            <span className="text-2xl sm:text-3xl">{hole}</span>
          </>
        ) : (
          <>
            {ru.result.whileHole} {hole},<br />
            {ru.result.onEarth}{' '}
            <span className="text-2xl sm:text-3xl">{earth}</span>
          </>
        )}
      </p>
      <p className="mt-3 text-sm text-ink-muted">
        {result.regime === 'flat'
          ? `${ru.result.flatSummary} · ${ru.result.flatDifference} ${difference}`
          : `${ru.result.slowerPrefix} ${slowdownText(result.slowdown)} ${ru.result.slowerSuffix} · ${ru.result.difference} ${difference}`}
      </p>
    </div>
  )
}
