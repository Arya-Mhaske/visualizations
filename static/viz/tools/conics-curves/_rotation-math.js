// Pure maths for Rotation of Axes, Polar Conics and Parametric Curves. Angles in degrees unless a name says radians. No DOM.
export const rad = (d) => (d * Math.PI) / 180;
export const deg = (r) => (r * 180) / Math.PI;

// ---- rotating the axes by θ: x = x′cos θ − y′sin θ, y = x′sin θ + y′cos θ ----
// q = {A, B, C, D, E, F} for A x² + B xy + C y² + D x + E y + F = 0; returns the same conic in the new axes.
export function rotateConic(q, theta) {
  const c = Math.cos(rad(theta));
  const s = Math.sin(rad(theta));
  return {
    A: q.A * c * c + q.B * s * c + q.C * s * s,
    B: (q.C - q.A) * 2 * s * c + q.B * (c * c - s * s),
    C: q.A * s * s - q.B * s * c + q.C * c * c,
    D: q.D * c + q.E * s,
    E: -q.D * s + q.E * c,
    F: q.F,
  };
}
export const disc = (q) => q.B * q.B - 4 * q.A * q.C;
// The angle that removes the xy term: cot 2θ = (A − C)/B, taken between 0° and 90°
export function removeAngle(q) {
  if (q.B === 0) return q.A <= q.C ? 0 : 90;
  let th = deg(Math.atan2(q.B, q.A - q.C)) / 2;
  if (th < 0) th += 90;
  return th;
}
// An ellipse x′²/a² + y′²/b² = 1 whose axes are turned by φ, written in the usual x, y
export function tiltedEllipse(a, b, phi) {
  const c = Math.cos(rad(phi));
  const s = Math.sin(rad(phi));
  return { A: c * c / (a * a) + s * s / (b * b), B: 2 * s * c * (1 / (a * a) - 1 / (b * b)), C: s * s / (a * a) + c * c / (b * b), D: 0, E: 0, F: -1 };
}
export const ellipseAt = (a, b, phi, t) => {
  const x = a * Math.cos(t);
  const y = b * Math.sin(t);
  const c = Math.cos(rad(phi));
  const s = Math.sin(rad(phi));
  return [x * c - y * s, x * s + y * c];
};

// ---- polar conics: r = ℓ / (1 − e cos θ), the focus at the pole, directrix x = −ℓ/e ----
export function polarPoint(l, e, theta, limit = 30) {
  const d = 1 - e * Math.cos(theta);
  if (Math.abs(d) < 1e-6) return null;
  const r = l / d; // a negative r is a real point on the other branch of a hyperbola
  return Math.abs(r) > limit ? null : [r * Math.cos(theta), r * Math.sin(theta)];
}
export const typeOf = (e) => (e === 0 ? 'circle' : e < 1 ? 'ellipse' : e === 1 ? 'parabola' : 'hyperbola');
// Rectangular form of r = ℓ/(1 − e cos θ):  (1 − e²) x² − 2 ℓ e x + y² = ℓ²
export const rectangular = (l, e) => ({ A: 1 - e * e, B: 0, C: 1, D: -2 * l * e, E: 0, F: -l * l });

// ---- Kepler: mean anomaly M (radians) to eccentric anomaly E, by Newton's method ----
export function eccentricAnomaly(M, e) {
  let E = M + e * Math.sin(M);
  for (let i = 0; i < 40; i++) E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
  return E;
}
// Orbit with a = 1, centre at the origin, Sun (focus) at (e, 0), perihelion at E = 0
export const orbitPoint = (e, E) => [Math.cos(E), Math.sqrt(1 - e * e) * Math.sin(E)];
export const distanceSun = (e, E) => 1 - e * Math.cos(E);
export const speedRatio = (e, E) => Math.sqrt(2 / distanceSun(e, E) - 1); // in units of the speed of a circular orbit of radius a

// ---- parametric curves ----
export const timings = {
  steady: (t) => t,
  speedUp: (t) => t * t,
  slowDown: (t) => 1 - (1 - t) * (1 - t),
};
export function cycloid(r, d, theta) {
  return [r * theta - d * Math.sin(theta), r - d * Math.cos(theta)];
}
export const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
// Roller of radius r rolling on a fixed circle of radius R: outside (epicycloid) or inside (hypocycloid)
export function roller(R, r, theta, outside) {
  const k = outside ? (R + r) / r : (R - r) / r;
  const m = outside ? R + r : R - r;
  return outside
    ? [m * Math.cos(theta) - r * Math.cos(k * theta), m * Math.sin(theta) - r * Math.sin(k * theta)]
    : [m * Math.cos(theta) + r * Math.cos(k * theta), m * Math.sin(theta) - r * Math.sin(k * theta)];
}
export const cusps = (R, r) => R / gcd(R, r);
export const turns = (R, r) => r / gcd(R, r); // trips round the fixed circle before the curve closes
export const lissajous = (a, b, delta, t) => [Math.sin(a * t + rad(delta)), Math.sin(b * t)];
export function deCasteljau(pts, t) {
  const levels = [pts];
  while (levels[levels.length - 1].length > 1) {
    const prev = levels[levels.length - 1];
    levels.push(prev.slice(1).map((p, i) => [prev[i][0] + (p[0] - prev[i][0]) * t, prev[i][1] + (p[1] - prev[i][1]) * t]));
  }
  return levels;
}
export function projectile(v0, angle, g, t) {
  const a = rad(angle);
  return [v0 * Math.cos(a) * t, v0 * Math.sin(a) * t - 0.5 * g * t * t];
}
export function flight(v0, angle, g) {
  const a = rad(angle);
  return { time: (2 * v0 * Math.sin(a)) / g, range: (v0 * v0 * Math.sin(2 * a)) / g, height: (v0 * v0 * Math.sin(a) ** 2) / (2 * g) };
}
