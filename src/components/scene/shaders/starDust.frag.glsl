precision highp float;

uniform float uSpeed;
varying float vAlpha;

void main() {
  // Вдали пыль холодная и белая, у дыры — янтарная, как диск.
  vec3 color = mix(vec3(0.8, 0.88, 1.0), vec3(1.0, 0.75, 0.45), uSpeed);
  gl_FragColor = vec4(color, vAlpha);
}
