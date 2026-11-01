// Pure maths for the Conics box. Angles in degrees unless a name says radians. No DOM.
export const rad = (d) => (d * Math.PI) / 180;
export const dist = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);
export const unit = (v) => { const m = Math.hypot(v[0], v[1]); return [v[0] / m, v[1] / m]; };
// Mirror a ray with direction d off a surface whose normal is n
export function reflect(d, n) {
  const u = unit(n);
  const k = 2 * (d[0] * u[0] + d[1] * u[1]);
  return [d[0] - k * u[0], d[1] - k * u[1]];
}

// ---- cone and plane (side view): cone half-angle alpha from the axis, plane angle beta with the axis ----
export function sectionType(alpha, beta) {
  if (beta === 90) return 'circle';
  if (beta > alpha) return 'ellipse';
  if (beta === alpha) return 'parabola';
  return 'hyperbola';
}
export const eccentricityOf = (alpha, beta) => Math.cos(rad(beta)) / Math.cos(rad(alpha));
// A point on the conic with a focus at the origin: r = l / (1 + e cos θ). Null where r is negative or huge.
export function polarPoint(l, e, theta, limit = 60, both = false) {
  const d = 1 + e * Math.cos(theta);
  if (Math.abs(d) <= 1e-6 || (d < 0 && !both)) return null;
  const r = l / d;
  return Math.abs(r) > limit ? null : [r * Math.cos(theta), r * Math.sin(theta)];
}
// Degenerate cut through the apex: point, one line or two lines
export function degenerate(alpha, beta) {
  if (beta > alpha) return { kind: 'point', lines: 0 };
  if (beta === alpha) return { kind: 'line', lines: 1 };
  return { kind: 'two lines', lines: 2, between: (2 * Math.atan(Math.sqrt((Math.cos(rad(beta)) * Math.tan(rad(alpha))) ** 2 - Math.sin(rad(beta)) ** 2)) * 180) / Math.PI };
}

// ---- A x² + B xy + C y² + D x + E y + F = 0 ----
export const conicValue = (q, x, y) => q.A * x * x + q.B * x * y + q.C * y * y + q.D * x + q.E * y + q.F;
export function classify(q) {
  const disc = q.B * q.B - 4 * q.A * q.C;
  // the 3 × 3 determinant: zero means the conic has fallen apart
  const det = q.A * (q.C * q.F - (q.E * q.E) / 4) - (q.B / 2) * ((q.B * q.F) / 2 - (q.D * q.E) / 4) + (q.D / 2) * ((q.B * q.E) / 4 - (q.C * q.D) / 2);
  const fallen = Math.abs(det) < 1e-9;
  let kind = disc < 0 ? 'ellipse' : disc === 0 ? 'parabola' : 'hyperbola';
  if (disc < 0 && q.B === 0 && q.A === q.C) kind = 'circle';
  return { disc, det, fallen, kind };
}

// ---- parabola y² = 4 a x ----
export const parabolaPoint = (a, t) => [a * t * t, 2 * a * t];
export const parabolaNormal = (a, p) => [-2 * a, p[1]]; // gradient of y² − 4 a x
// A ray travelling in −x at height y0 meets the parabola, reflects, and heads for the focus
export function dishRay(a, y0) {
  const hit = [(y0 * y0) / (4 * a), y0];
  const out = reflect([-1, 0], parabolaNormal(a, hit));
  return { hit, out };
}
export function circleRay(R, y0) {
  // circle through the origin with centre (R, 0); hit on the near side
  const x = R - Math.sqrt(R * R - y0 * y0);
  const hit = [x, y0];
  return { hit, out: reflect([-1, 0], [hit[0] - R, hit[1]]) };
}
// Where a reflected ray from `hit` with direction `out` crosses the axis y = 0
export function axisCross(hit, out) {
  if (Math.abs(out[1]) < 1e-12) return null;
  return hit[0] + (-hit[1] / out[1]) * out[0];
}
// How far a straight line from p along direction d passes from point q
export function missDistance(p, d, q) {
  const u = unit(d);
  return Math.abs((q[0] - p[0]) * u[1] - (q[1] - p[1]) * u[0]);
}
export const chordAt = (a, x) => 2 * Math.sqrt(Math.max(0, 4 * a * x));

// ---- ellipse x²/a² + y²/b² = 1 ----
export const focalC = (a, b) => Math.sqrt(Math.max(0, a * a - b * b));
export const ellipsePoint = (a, b, t) => [a * Math.cos(t), b * Math.sin(t)];
// First hit of a ray from p along d on the ellipse (the nearest t > 0)
export function ellipseHit(a, b, p, d) {
  const A = (d[0] / a) ** 2 + (d[1] / b) ** 2;
  const B = 2 * ((p[0] * d[0]) / (a * a) + (p[1] * d[1]) / (b * b));
  const C = (p[0] / a) ** 2 + (p[1] / b) ** 2 - 1;
  const disc = B * B - 4 * A * C;
  const t = (-B + Math.sqrt(disc)) / (2 * A);
  return [p[0] + t * d[0], p[1] + t * d[1]];
}
export const ellipseNormal = (a, b, p) => [p[0] / (a * a), p[1] / (b * b)];
export const ellipseHalfHeight = (a, b, x) => (Math.abs(x) >= a ? 0 : b * Math.sqrt(1 - (x * x) / (a * a)));
export const ellipseLatus = (a, b) => (2 * b * b) / a;
export function orbit(a, e) {
  return { b: a * Math.sqrt(1 - e * e), c: a * e, peri: a * (1 - e), apo: a * (1 + e), l: a * (1 - e * e) };
}
export const BODIES = [
  ['Mercury', 0.387, 0.2056],
  ['Earth', 1.0, 0.0167],
  ['Mars', 1.524, 0.0934],
  ["Halley's comet", 17.8, 0.967],
];

// ---- hyperbola x²/a² − y²/b² = 1 ----
export const hyperbolaPoint = (a, b, t, branch = 1) => [branch * a * Math.cosh(t), b * Math.sinh(t)];
export const hyperbolaC = (a, b) => Math.sqrt(a * a + b * b);
export const asymptoteGap = (a, b, x) => (b / a) * (x - Math.sqrt(x * x - a * a));
// LORAN: signals travel at the speed of light, 0.299792458 km per microsecond
export const KM_PER_US = 0.299792458;
export const timeDiff = (p, m, s) => (dist(p, m) - dist(p, s)) / KM_PER_US;
export const cometHalfAngle = (e) => (e > 1 ? (Math.acos(-1 / e) * 180) / Math.PI : 180);
