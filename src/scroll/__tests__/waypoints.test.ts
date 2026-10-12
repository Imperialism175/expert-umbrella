import { describe, expect, it } from 'vitest'
import { ru } from '@/i18n/ru'
import { activeWaypoint, WAYPOINTS } from '../waypoints'

describe('вехи спуска', () => {
  it('идут сверху вниз', () => {
    for (let i = 1; i < WAYPOINTS.length; i++) {
      expect(WAYPOINTS[i]!.logHeight).toBeLessThan(WAYPOINTS[i - 1]!.logHeight)
    }
  })

  it('у каждой вехи есть подпись', () => {
    for (const waypoint of WAYPOINTS) {
      expect(ru.waypoints[waypoint.id]).toBeTruthy()
    }
  })

  it('подпись показывается рядом с вехой', () => {
    expect(activeWaypoint(3)).toBe('far')
    expect(activeWaypoint(2.8)).toBe('far')
    expect(activeWaypoint(Math.log10(2))).toBe('isco')
    expect(activeWaypoint(Math.log10(0.5) + 0.1)).toBe('photonSphere')
    expect(activeWaypoint(-4)).toBe('edge')
  })

  it('между вехами подписи нет', () => {
    expect(activeWaypoint(1.5)).toBeNull()
    expect(activeWaypoint(0)).toBeNull()
    expect(activeWaypoint(-2)).toBeNull()
  })

  it('зоны соседних вех не пересекаются', () => {
    for (let logHeight = 3; logHeight >= -4; logHeight -= 0.01) {
      const matches = WAYPOINTS.filter(
        (waypoint) => Math.abs(waypoint.logHeight - logHeight) <= 0.25,
      )
      expect(matches.length).toBeLessThanOrEqual(1)
    }
  })
})
