import { shadowAngularRadius } from '@/physics/schwarzschild'

/** Диапазон высот над горизонтом (в rs), который умеет показывать сцена. */
export const MIN_SCENE_HEIGHT = 1e-4
export const MAX_SCENE_HEIGHT = 1e3

/** Вдали камера приближает так, чтобы диск занимал около двух третей кадра. */
const DISK_FRAMING = 19.5
/** Самый широкий угол обзора, рад (от центра кадра до края по короткой стороне). */
const MAX_HALF_FOV = 1.3
/** На таком угле над центром кадра удерживается край тени, рад. */
const SHADOW_EDGE_OFFSET = 0.35

export interface SceneView {
  /** Радиальная координата наблюдателя, в rs. */
  radius: number
  /** 1 − rs/r, вычислено без вычитания близких чисел. */
  lapse: number
  halfFov: number
  /** Наклон взгляда вверх от направления на дыру, рад. */
  tilt: number
}

export function clampSceneHeight(heightInRs: number): number {
  if (!(heightInRs > MIN_SCENE_HEIGHT)) return MIN_SCENE_HEIGHT
  return Math.min(heightInRs, MAX_SCENE_HEIGHT)
}

/**
 * Параметры камеры для наблюдателя, зависшего на заданной высоте над горизонтом.
 *
 * Вдали дыра была бы точкой, поэтому камера приближает. Вблизи тень закрывает
 * большую часть неба, поэтому камера расширяет угол и поднимает взгляд так,
 * чтобы край тени оставался в кадре.
 */
export function sceneView(heightInRs: number): SceneView {
  const height = clampSceneHeight(heightInRs)
  const radius = 1 + height
  return {
    radius,
    lapse: height / radius,
    halfFov: Math.min(DISK_FRAMING / radius, MAX_HALF_FOV),
    tilt: Math.max(0, shadowAngularRadius(height, 1) - SHADOW_EDGE_OFFSET),
  }
}
