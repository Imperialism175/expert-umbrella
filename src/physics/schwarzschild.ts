import { C } from './constants'

/*
 * Формулы метрики Шварцшильда.
 *
 * Положение задаётся парой (h, rs): высота над горизонтом h = r − rs и радиус
 * Шварцшильда rs. Так у самого горизонта не приходится вычитать почти равные
 * числа (r − rs), и точность не теряется.
 */

/** Радиус Шварцшильда rs = 2GM/c², м. */
export function schwarzschildRadius(gravParam: number): number {
  return (2 * gravParam) / (C * C)
}

/** 1 − √(1 − x) без потери точности при малых x. */
export function oneMinusSqrtOneMinus(x: number): number {
  return x / (1 + Math.sqrt(1 - x))
}

/** dτ/dt для неподвижного наблюдателя: √(1 − rs/r). */
export function staticFactor(h: number, rs: number): number {
  return Math.sqrt(h / (h + rs))
}

/** dτ/dt на круговой орбите: √(1 − 3rs/(2r)). Определён при r > 1,5 rs. */
export function orbitFactor(h: number, rs: number): number {
  return Math.sqrt((2 * h - rs) / (2 * (h + rs)))
}

/** Скорость убегания, м/с. */
export function escapeVelocity(h: number, rs: number): number {
  return C * Math.sqrt(rs / (h + rs))
}

/** Собственное ускорение, нужное, чтобы висеть на месте, м/с². */
export function hoverAcceleration(
  gravParam: number,
  h: number,
  rs: number,
): number {
  const r = h + rs
  return gravParam / (r * r * staticFactor(h, rs))
}

/** Радиальный приливный градиент 2GM/r³, с⁻² (ускорение на метр длины тела). */
export function tidalGradient(gravParam: number, r: number): number {
  return (2 * gravParam) / (r * r * r)
}

/** Орбитальная скорость относительно локального неподвижного наблюдателя, м/с. */
export function orbitalSpeed(h: number, rs: number): number {
  return C * Math.sqrt(rs / (2 * h))
}

/** Период обращения по часам далёкого наблюдателя, с. */
export function orbitalPeriod(gravParam: number, r: number): number {
  return 2 * Math.PI * Math.sqrt((r * r * r) / gravParam)
}
