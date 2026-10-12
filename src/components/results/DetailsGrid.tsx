import { formatDuration } from '@/format/duration'
import { formatLength } from '@/format/length'
import { formatNumber } from '@/format/number'
import { ru } from '@/i18n/ru'
import { BODY_LENGTH, type ComputeResult } from '@/physics/compute'
import { C, STANDARD_GRAVITY } from '@/physics/constants'

const inG = (acceleration: number) =>
  `${formatNumber(acceleration / STANDARD_GRAVITY)} g`
const inC = (speed: number) => `${formatNumber(speed / C, 4)} c`

/** Вдали от дыры фактор неотличим от 1, поэтому показываем его как «1 − δ». */
function factorText(result: ComputeResult): string {
  return result.regime === 'flat' || result.regime === 'weak'
    ? `1 − ${formatNumber(result.deficit)}`
    : formatNumber(result.factor, 6)
}

interface DetailsGridProps {
  result: ComputeResult
}

/** Производные величины: положение, красное смещение, перегрузки, орбита. */
export function DetailsGrid({ result }: DetailsGridProps) {
  const items: [label: string, value: string][] = [
    [ru.details.schwarzschildRadius, formatLength(result.schwarzschildRadius)],
    [
      ru.details.position,
      `${formatLength(result.radius)} (${formatNumber(result.radiusInRs, 4)} rₛ)`,
    ],
    [ru.details.height, formatLength(result.heightAboveHorizon)],
    [ru.details.factor, factorText(result)],
    [ru.details.redshift, formatNumber(result.redshift)],
    [ru.details.escapeVelocity, inC(result.escapeVelocity)],
    result.orbit
      ? [ru.details.orbitalSpeed, inC(result.orbit.speed)]
      : [ru.details.hover, inG(result.hoverAcceleration)],
    [ru.details.tides, inG(result.tidalGradient * BODY_LENGTH)],
  ]
  if (result.orbit) {
    items.push([ru.details.orbitalPeriod, formatDuration(result.orbit.period)])
  }

  return (
    <section aria-labelledby="details-heading">
      <h3 id="details-heading" className="sr-only">
        {ru.details.heading}
      </h3>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 xl:grid-cols-1">
        {items.map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs text-ink-muted">{label}</dt>
            <dd className="mt-0.5 font-mono text-sm">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
