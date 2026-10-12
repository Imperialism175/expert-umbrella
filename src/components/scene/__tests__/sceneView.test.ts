import { describe, expect, it } from 'vitest'
import {
  clampSceneHeight,
  MAX_SCENE_HEIGHT,
  MIN_SCENE_HEIGHT,
  sceneView,
} from '../sceneView'

describe('clampSceneHeight', () => {
  it('ограничивает высоту диапазоном сцены', () => {
    expect(clampSceneHeight(5)).toBe(5)
    expect(clampSceneHeight(1e9)).toBe(MAX_SCENE_HEIGHT)
    expect(clampSceneHeight(0)).toBe(MIN_SCENE_HEIGHT)
    expect(clampSceneHeight(-3)).toBe(MIN_SCENE_HEIGHT)
    expect(clampSceneHeight(NaN)).toBe(MIN_SCENE_HEIGHT)
  })
})

describe('sceneView', () => {
  it('переводит высоту в радиус и темп времени без потери точности', () => {
    const view = sceneView(1)
    expect(view.radius).toBe(2)
    expect(view.lapse).toBe(0.5)
    expect(sceneView(1e-4).lapse).toBeCloseTo(1e-4 / 1.0001, 15)
  })

  it('вдали приближает и смотрит прямо на дыру', () => {
    const view = sceneView(1000)
    expect(view.halfFov).toBeLessThan(0.03)
    expect(view.tilt).toBe(0)
  })

  it('вблизи расширяет угол до предела и поднимает взгляд', () => {
    const view = sceneView(1)
    expect(view.halfFov).toBe(1.3)
    expect(view.tilt).toBeGreaterThan(0.5)
  })

  it('у самого горизонта смотрит почти прямо от дыры', () => {
    expect(sceneView(1e-4).tilt).toBeGreaterThan(2.5)
    expect(sceneView(1e-4).tilt).toBeLessThan(Math.PI)
  })

  it('угол обзора и наклон меняются монотонно при спуске', () => {
    let previous = sceneView(1000)
    for (let exponent = 2.9; exponent >= -4; exponent -= 0.1) {
      const view = sceneView(10 ** exponent)
      expect(view.halfFov).toBeGreaterThanOrEqual(previous.halfFov)
      expect(view.tilt).toBeGreaterThanOrEqual(previous.tilt)
      previous = view
    }
  })
})
