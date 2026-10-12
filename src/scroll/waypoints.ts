export type WaypointId =
  'far' | 'isco' | 'photonSphere' | 'deep' | 'skyCircle' | 'edge'

export interface Waypoint {
  id: WaypointId
  /** log₁₀ высоты над горизонтом в rs. */
  logHeight: number
}

/** Вехи спуска — от далёких окрестностей до горизонта. */
export const WAYPOINTS: readonly Waypoint[] = [
  { id: 'far', logHeight: 3 },
  // r = 3 rs: последняя устойчивая круговая орбита.
  { id: 'isco', logHeight: Math.log10(2) },
  // r = 1,5 rs: тень занимает половину неба.
  { id: 'photonSphere', logHeight: Math.log10(0.5) },
  { id: 'deep', logHeight: -1 },
  { id: 'skyCircle', logHeight: -3 },
  { id: 'edge', logHeight: -4 },
]

/** На таком расстоянии от вехи (в единицах logHeight) показывается её подпись. */
const CAPTION_RANGE = 0.25

export function activeWaypoint(logHeight: number): WaypointId | null {
  const nearest = WAYPOINTS.find(
    (waypoint) => Math.abs(waypoint.logHeight - logHeight) <= CAPTION_RANGE,
  )
  return nearest?.id ?? null
}
