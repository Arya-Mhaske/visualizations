// Pure maths for the Coordinate Plane box. No DOM.
export const distance = ([x1, y1], [x2, y2]) => Math.hypot(x2 - x1, y2 - y1);
export const midpoint = ([x1, y1], [x2, y2]) => [(x1 + x2) / 2, (y1 + y2) / 2];
// Squares on the two legs and on the hypotenuse: areas dx^2, dy^2 and d^2.
export function squares([x1, y1], [x2, y2]) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return { dx2: dx * dx, dy2: dy * dy, d2: dx * dx + dy * dy };
}

// ---- circles ----
// Left side of (x - h)^2 + (y - k)^2 = r^2: its excess over r^2 says on (0), inside (<0) or outside (>0).
export const circleGap = ([x, y], [h, k], r) => (x - h) ** 2 + (y - k) ** 2 - r * r;
export const onCircle = (p, c, r, tol = 1e-9) => Math.abs(circleGap(p, c, r)) <= tol;
export const circlePoint = ([h, k], r, angle) => [h + r * Math.cos(angle), k + r * Math.sin(angle)];
// x^2 + y^2 + Dx + Ey + F = 0, by completing the square twice.
export function generalCircle(D, E, F) {
  const h = -D / 2;
  const k = -E / 2;
  const r2 = (D * D) / 4 + (E * E) / 4 - F;
  return { h, k, r2, kind: r2 > 1e-12 ? 'circle' : r2 > -1e-12 ? 'point' : 'empty', r: r2 > 0 ? Math.sqrt(r2) : 0 };
}

// ---- symmetry: each curve is given by parametric points and by a relation R(x, y) = 0 ----
export const CURVES = [
  { id: 'a', text: 'y = x² − 3', rel: (x, y) => y - x * x + 3, at: (t) => [t, t * t - 3], t: [-3, 3] },
  { id: 'b', text: 'y = x³ − 3x', rel: (x, y) => y - x ** 3 + 3 * x, at: (t) => [t, t ** 3 - 3 * t], t: [-2.3, 2.3] },
  { id: 'c', text: 'x = y² − 2', rel: (x, y) => x - y * y + 2, at: (t) => [t * t - 2, t], t: [-2.6, 2.6] },
  { id: 'd', text: 'y = x² + x − 2', rel: (x, y) => y - x * x - x + 2, at: (t) => [t, t * t + t - 2], t: [-3, 2.5] },
];
export const MIRRORS = {
  y: ([x, y]) => [-x, y], // replace x by -x: the y-axis
  x: ([x, y]) => [x, -y], // replace y by -y: the x-axis
  origin: ([x, y]) => [-x, -y], // both
};
export const onCurve = (curve, p, tol = 1e-9) => Math.abs(curve.rel(p[0], p[1])) <= tol;
// How many of n sample points of the curve have their mirror image on the curve too.
export function mirrorScore(curve, mirror, n = 41) {
  let ok = 0;
  const [a, b] = curve.t;
  for (let i = 0; i < n; i++) {
    const p = curve.at(a + ((b - a) * i) / (n - 1));
    if (onCurve(curve, MIRRORS[mirror](p), 1e-9)) ok++;
  }
  return ok;
}
// The curve's symmetries over the whole sample.
export const symmetries = (curve) => Object.keys(MIRRORS).filter((m) => mirrorScore(curve, m) === 41);

// ---- distance from a point to a line a x + b y + c = 0, and the foot of the perpendicular ----
export const lineFrom = (m, q) => ({ a: -m, b: 1, c: -q }); // y = m x + q
export const pointLine = (L, [x, y]) => Math.abs(L.a * x + L.b * y + L.c) / Math.hypot(L.a, L.b);
export function foot(L, [x, y]) {
  const s = (L.a * x + L.b * y + L.c) / (L.a * L.a + L.b * L.b);
  return [x - L.a * s, y - L.b * s];
}
// Point on the line y = m x + q at parameter x.
export const onLine = (m, q, x) => [x, m * x + q];
export const distToPoint = (m, q, x, Q) => distance(onLine(m, q, x), Q);

// ---- plotting by points ----
export const FUNCS = [
  { id: 'line', view: [-12, 8], text: 'y = 2x − 4', f: (x) => 2 * x - 4, xInt: [2], order: [0, -2, 2, -1, 1, -3, 3] },
  { id: 'parabola', view: [-6, 8], text: 'y = x² − 4', f: (x) => x * x - 4, xInt: [-2, 2], order: [0, -2, 2, -1, 1, -3, 3] },
  { id: 'cubic', view: [-16, 16], text: 'y = x³ − 4x', f: (x) => x ** 3 - 4 * x, xInt: [-2, 0, 2], order: [0, -2, 2, -1, 1, -3, 3] },
  { id: 'abs', view: [-4, 4], text: 'y = |x| − 2', f: (x) => Math.abs(x) - 2, xInt: [-2, 2], order: [0, -2, 2, -1, 1, -3, 3] },
];
export const tableOf = (fn, k) => fn.order.slice(0, k).map((x) => [x, fn.f(x)]);
export const yIntercept = (fn) => fn.f(0);

// The square on side p-q, built on the side away from `third` (so it lies outside the triangle).
export function squareOn(p, q, third) {
  const e = [q[0] - p[0], q[1] - p[1]];
  let n = [-e[1], e[0]];
  if (n[0] * (third[0] - p[0]) + n[1] * (third[1] - p[1]) > 0) n = [-n[0], -n[1]];
  return [p, q, [q[0] + n[0], q[1] + n[1]], [p[0] + n[0], p[1] + n[1]]];
}
export function polygonArea(pts) {
  let s = 0;
  pts.forEach((p, i) => {
    const q = pts[(i + 1) % pts.length];
    s += p[0] * q[1] - q[0] * p[1];
  });
  return Math.abs(s) / 2;
}
