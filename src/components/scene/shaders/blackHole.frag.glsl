// Чёрная дыра Шварцшильда: трассировка лучей света от неподвижного наблюдателя.
// Единица длины — радиус Шварцшильда (rs = 1), горизонт на r = 1.
precision highp float;

uniform float uTime;
uniform vec2 uResolution;
// Радиальная координата наблюдателя, в rs.
uniform float uRadius;
// 1 − rs/r для наблюдателя; передаётся отдельно, чтобы не терять точность у горизонта.
uniform float uLapse;
// Угол от центра кадра до края по короткой стороне, рад.
uniform float uHalfFov;
// Наклон взгляда вверх от направления на дыру, рад.
uniform float uTilt;

const float PI = 3.14159265359;
// Угол камеры над плоскостью диска, рад.
const float INCLINATION = 0.21;
const float DISK_INNER = 3.0;
const float DISK_OUTER = 12.0;
// Дальше этого радиуса искривлением лучей пренебрегаем.
const float FAR_RADIUS = 40.0;
const float ESCAPE_RADIUS = 42.0;
// Период перезапуска рисунка диска, с (см. diskPattern).
const float PATTERN_PERIOD = 20.0;

float hash13(vec3 p) {
  p = fract(p * 0.1031);
  p += dot(p, p.zyx + 31.32);
  return fract((p.x + p.y) * p.z);
}

vec3 hash33(vec3 p) {
  p = fract(p * vec3(0.1031, 0.1030, 0.0973));
  p += dot(p, p.yxz + 33.33);
  return fract((p.xxy + p.yxx) * p.zyx);
}

float noise3(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(
      mix(hash13(i), hash13(i + vec3(1, 0, 0)), f.x),
      mix(hash13(i + vec3(0, 1, 0)), hash13(i + vec3(1, 1, 0)), f.x),
      f.y
    ),
    mix(
      mix(hash13(i + vec3(0, 0, 1)), hash13(i + vec3(1, 0, 1)), f.x),
      mix(hash13(i + vec3(0, 1, 1)), hash13(i + vec3(1, 1, 1)), f.x),
      f.y
    ),
    f.z
  );
}

float fbm(vec3 p) {
  float amplitude = 0.5;
  float sum = 0.0;
  for (int i = 0; i < 4; i++) {
    sum += amplitude * noise3(p);
    p = p * 2.03 + 7.1;
    amplitude *= 0.5;
  }
  return sum;
}

// Один слой звёзд: в каждой ячейке трёхмерной решётки — одна звезда.
// Видны те, что оказались у поверхности единичной сферы направлений.
vec3 starLayer(vec3 dir, float cells, float pixelAngle) {
  vec3 p = dir * cells;
  vec3 id = floor(p);
  vec3 rnd = hash33(id);
  vec3 star = id + 0.2 + 0.6 * rnd;
  float angle = length(p - star) / cells;
  float core = 1.0 - smoothstep(0.0, pixelAngle * 1.7, angle);
  float brightness = 0.25 + 3.5 * pow(hash13(id + 17.0), 8.0);
  vec3 tint = mix(vec3(1.0, 0.82, 0.62), vec3(0.72, 0.86, 1.0), rnd.y);
  return tint * core * brightness;
}

vec3 sky(vec3 dir, float pixelAngle) {
  vec3 color = vec3(0.0);
  // Слои разной мелкости: при любом зуме работают те, чьи ячейки
  // занимают на экране от нескольких до десятков пикселей.
  float cells = 12.0;
  for (int i = 0; i < 6; i++) {
    float cellPixels = 1.0 / (cells * pixelAngle);
    float weight = smoothstep(5.0, 14.0, cellPixels);
    if (weight > 0.0) color += weight * starLayer(dir, cells, pixelAngle);
    cells *= 3.0;
  }

  float nebula = pow(fbm(dir * 2.6 + 3.0), 3.0);
  color += nebula * vec3(0.10, 0.12, 0.30) * 0.22;

  // Свет далёких звёзд для зависшего наблюдателя синеет и становится ярче.
  float blueshift = inversesqrt(uLapse);
  color *= min(blueshift * blueshift, 8.0);
  return mix(
    color,
    color * vec3(0.6, 0.85, 1.7),
    clamp((blueshift - 1.0) * 0.6, 0.0, 1.0)
  );
}

vec3 diskRamp(float temperature) {
  vec3 color = mix(
    vec3(1.0, 0.18, 0.02),
    vec3(1.0, 0.55, 0.15),
    smoothstep(0.3, 0.8, temperature)
  );
  color = mix(color, vec3(1.0, 0.9, 0.75), smoothstep(0.8, 1.5, temperature));
  return mix(color, vec3(0.75, 0.85, 1.0), smoothstep(1.5, 2.6, temperature));
}

// Клочковатая структура диска, вращающаяся быстрее у внутреннего края.
// Из-за разной угловой скорости рисунок со временем закручивается в кольца,
// поэтому два сдвинутых по фазе слоя перезапускаются и плавно сменяют друг друга.
float diskPattern(float radius, float azimuth) {
  float angularSpeed = 2.2 * pow(radius, -1.5);
  float sum = 0.0;
  for (int i = 0; i < 2; i++) {
    float phase = fract(uTime / PATTERN_PERIOD + 0.5 * float(i));
    float angle = azimuth - angularSpeed * PATTERN_PERIOD * (phase - 0.5);
    float weight = 1.0 - abs(2.0 * phase - 1.0);
    sum +=
      weight *
      fbm(vec3(radius * 2.4, 1.6 * cos(angle), 1.6 * sin(angle)) + 11.0 * float(i));
  }
  return sum;
}

// Цвет (rgb) и непрозрачность (a) диска в точке пересечения с лучом.
vec4 shadeDisk(vec3 hit, vec3 rayVelocity) {
  float radius = length(hit);
  float edge =
    smoothstep(DISK_INNER, DISK_INNER + 0.5, radius) *
    (1.0 - smoothstep(DISK_OUTER * 0.6, DISK_OUTER, radius));
  float pattern = diskPattern(radius, atan(hit.z, hit.x));

  // Газ движется по круговой орбите; его скорость относительно
  // неподвижного наблюдателя на том же радиусе — sqrt(rs / (2 (r − rs))).
  float beta = sqrt(0.5 / (radius - 1.0));
  float gamma = inversesqrt(1.0 - beta * beta);
  vec3 gasDirection = normalize(vec3(-hit.z, 0.0, hit.x));
  // Луч трассируется от камеры, фотон летит навстречу.
  float cosAngle = dot(gasDirection, -normalize(rayVelocity));
  float doppler = 1.0 / (gamma * (1.0 - beta * cosAngle));
  float gravitational = sqrt((1.0 - 1.0 / radius) / uLapse);
  float shift = min(doppler * gravitational, 3.0);

  float temperature = 1.15 * pow(DISK_INNER / radius, 0.75) * shift;
  float intensity =
    2.4 *
    pow(DISK_INNER / radius, 2.0) *
    shift * shift * shift *
    (0.3 + 2.2 * pattern * pattern);
  float opacity = 0.92 * edge * clamp(0.45 + 0.9 * pattern, 0.0, 1.0);
  return vec4(diskRamp(temperature) * intensity * edge, opacity);
}

// Траектория света в метрике Шварцшильда совпадает с движением частицы
// под центральной силой a = −1,5 · h² · x / r⁵, где h = |x × v| сохраняется
// (это уравнение Бине u″ + u = 1,5·u² в декартовых координатах).
vec3 trace(vec3 x, vec3 v, float pixelAngle) {
  vec3 color = vec3(0.0);
  float covered = 0.0;
  // 0 выключает цикл для лучей, прошедших далеко от дыры.
  int steps = STEPS;

  if (uRadius > FAR_RADIUS) {
    float along = dot(x, v);
    float discriminant = along * along - dot(x, x) + FAR_RADIUS * FAR_RADIUS;
    if (discriminant < 0.0 || along > 0.0) {
      color = sky(v, pixelAngle);
      steps = 0;
    } else {
      x += v * (-along - sqrt(discriminant));
    }
  }

  vec3 momentum = cross(x, v);
  float h2 = dot(momentum, momentum);

  float r = length(x);
  float r2 = r * r;
  vec3 acceleration = -1.5 * h2 * x / (r2 * r2 * r);

  for (int i = 0; i < STEPS; i++) {
    if (i >= steps) break;
    float dt = clamp(STEP_SCALE * r, 0.02, 3.0);
    vec3 next = x + v * dt + 0.5 * acceleration * dt * dt;
    float nextR = length(next);
    float nextR2 = nextR * nextR;
    vec3 nextAcceleration = -1.5 * h2 * next / (nextR2 * nextR2 * nextR);
    v += 0.5 * (acceleration + nextAcceleration) * dt;

    // Пересечение плоскости диска y = 0 на этом шаге.
    if (x.y * next.y < 0.0) {
      vec3 hit = mix(x, next, x.y / (x.y - next.y));
      float hitRadius = length(hit);
      if (hitRadius > DISK_INNER && hitRadius < DISK_OUTER) {
        vec4 disk = shadeDisk(hit, v);
        color += (1.0 - covered) * disk.rgb * disk.a;
        covered += (1.0 - covered) * disk.a;
        if (covered > 0.98) break;
      }
    }

    x = next;
    r = nextR;
    acceleration = nextAcceleration;

    // Луч ушёл под горизонт. Лучи, которым не хватило шагов, кружат
    // у фотонной сферы и тоже остаются тенью.
    if (r < 1.0) break;
    if (r > ESCAPE_RADIUS && dot(x, v) > 0.0) {
      color += (1.0 - covered) * sky(normalize(v), pixelAngle);
      break;
    }
  }

  return color;
}

void main() {
  float halfShort = 0.5 * min(uResolution.x, uResolution.y);
  vec2 p = (gl_FragCoord.xy - 0.5 * uResolution) / halfShort;
  // На вытянутом экране углы кадра не должны уходить за 150° от центра.
  float halfFov = min(uHalfFov, 2.6 * halfShort / (0.5 * length(uResolution)));
  float pixelAngle = halfFov / halfShort;
  // Проекция «рыбий глаз»: расстояние от центра кадра пропорционально углу,
  // поэтому поле зрения может превышать 180°.
  float theta = length(p) * halfFov;

  vec3 color = vec3(0.0);
  if (theta < PI) {
    vec3 outward = vec3(0.0, sin(INCLINATION), cos(INCLINATION));
    vec3 toHole = -outward;
    vec3 north = normalize(vec3(0.0, 1.0, 0.0) - outward.y * outward);
    vec3 right = cross(toHole, north);
    vec3 forward = cos(uTilt) * toHole + sin(uTilt) * north;
    vec3 up = -sin(uTilt) * toHole + cos(uTilt) * north;

    vec2 screenDirection = p / max(length(p), 1e-6);
    vec3 localDirection = normalize(
      cos(theta) * forward +
        sin(theta) * (screenDirection.x * right + screenDirection.y * up)
    );

    // Переход от направления, которое видит неподвижный наблюдатель,
    // к координатному: радиальная составляющая сжимается в sqrt(1 − rs/r) раз.
    float radial = dot(localDirection, outward);
    vec3 tangential = localDirection - radial * outward;
    vec3 velocity = normalize(outward * radial * sqrt(uLapse) + tangential);

    color = trace(outward * uRadius, velocity, pixelAngle);
  }

  color = 1.0 - exp(-color * 1.15);
  color = pow(color, vec3(1.0 / 2.2));
  // Лёгкий шум против полос на плавных градиентах.
  color += (hash13(vec3(gl_FragCoord.xy, uTime)) - 0.5) / 255.0;
  gl_FragColor = vec4(color, 1.0);
}
