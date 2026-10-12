// Звёздная пыль: короткие штрихи, текущие мимо корабля в сторону дыры.
// Каждая частица — отрезок из двух вершин: «голова» (aEnd = 0) и «хвост» (aEnd = 1).
// В position лежит случайная точка единичного куба, одинаковая для обеих вершин.
attribute float aEnd;

// Пройденный путь в долях размера области (накапливается на стороне JS).
uniform float uOffset;
// Наклон взгляда вверх от направления на дыру, рад.
uniform float uTilt;
uniform float uAspect;
// Скорость потока в долях скорости света.
uniform float uSpeed;

varying float vAlpha;

// Сторона куба вокруг камеры, в котором живут частицы.
const float BOX = 8.0;
const float FOCAL = 1.2;

void main() {
  // Камера: x — вправо, y — вверх, z — вперёд. Дыра ниже центра кадра на uTilt.
  vec3 flow = vec3(0.0, -sin(uTilt), cos(uTilt));

  // Частицы бесконечно текут вдоль flow: вышедшая из куба появляется с другой стороны.
  vec3 point = (fract(position + flow * uOffset) - 0.5) * BOX;
  // Чем быстрее поток, тем длиннее штрих.
  point -= flow * aEnd * (0.01 + 0.14 * uSpeed);

  float fade =
    smoothstep(0.1, 0.8, point.z) * (1.0 - smoothstep(2.5, 4.0, length(point)));
  vAlpha = (1.0 - aEnd) * fade * (0.08 + 0.3 * uSpeed);

  // Перспектива вручную: w = глубина, вершины позади камеры отсекаются сами.
  gl_Position = vec4(point.x * FOCAL / uAspect, point.y * FOCAL, 0.0, point.z);
}
