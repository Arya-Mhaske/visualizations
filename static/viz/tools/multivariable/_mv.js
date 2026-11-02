// Shared maths and drawing for the multivariable subject. z = f(x, y) surfaces over [−R, R]², numerical partials,
// a 3D surface painter for createCamera, and level curves for createPlot.
import { contour } from '../vectors-3d/_quadric-surfaces-math.js';
import { line } from '../../lib/draw.js';

export const SURF = {
  hill: { name: 'Hill', R: 3, f: (x, y) => 3 * Math.exp(-(x * x + y * y) / 4) },
  bowl: { name: 'Bowl', R: 3, f: (x, y) => (x * x + y * y) / 3 },
  saddle: { name: 'Saddle', R: 3, f: (x, y) => (x * x - y * y) / 3 },
  waves: { name: 'Waves', R: 3, f: (x, y) => 1.3 * Math.sin(x) * Math.cos(y) },
  two: { name: 'Two hills', R: 3, f: (x, y) => 2.2 * Math.exp(-((x - 1.2) ** 2 + y * y)) + 1.6 * Math.exp(-((x + 1.3) ** 2 + (y + 0.9) ** 2)) },
  ramp: { name: 'Ramp', R: 3, f: (x, y) => 0.5 * x + 0.3 * y },
};
const H = 1e-4;
export const fx = (f, x, y) => (f(x + H, y) - f(x - H, y)) / (2 * H);
export const fy = (f, x, y) => (f(x, y + H) - f(x, y - H)) / (2 * H);
const H2 = 1e-3;
export const fxx = (f, x, y) => (f(x + H2, y) - 2 * f(x, y) + f(x - H2, y)) / (H2 * H2);
export const fyy = (f, x, y) => (f(x, y + H2) - 2 * f(x, y) + f(x, y - H2)) / (H2 * H2);
export const fxy = (f, x, y) => (f(x + H2, y + H2) - f(x + H2, y - H2) - f(x - H2, y + H2) + f(x - H2, y - H2)) / (4 * H2 * H2);
export const grad = (f, x, y) => [fx(f, x, y), fy(f, x, y)];
export const clampTo = (v, R) => Math.max(-R, Math.min(R, v));

export function zRange(f, R, n = 40) {
  let lo = Infinity;
  let hi = -Infinity;
  for (let i = 0; i <= n; i++) for (let j = 0; j <= n; j++) { const z = f(-R + (2 * R * i) / n, -R + (2 * R * j) / n); lo = Math.min(lo, z); hi = Math.max(hi, z); }
  return [lo, hi];
}
export const levelList = (f, R, count = 9) => { const [lo, hi] = zRange(f, R); return Array.from({ length: count }, (_, i) => lo + ((hi - lo) * (i + 1)) / (count + 1)); };

// A height-banded fill: low parts blue, then green, yellow, coral.
export function heightFill(c, z, lo, hi) {
  const t = hi > lo ? (z - lo) / (hi - lo) : 0.5;
  return t < 0.25 ? c.fillB : t < 0.5 ? c.fillC : t < 0.75 ? c.fillY : c.fillA;
}
// Faces of the surface for cam.faces. n × n quads.
export function surfaceFaces(c, f, R, n = 20, { stroke = c.ink, width = 1, zScale = 1 } = {}) {
  const [lo, hi] = zRange(f, R);
  const faces = [];
  const p = (i, j) => { const x = -R + (2 * R * i) / n; const y = -R + (2 * R * j) / n; return [x, y, f(x, y) * zScale]; };
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const pts = [p(i, j), p(i + 1, j), p(i + 1, j + 1), p(i, j + 1)];
    const mean = pts.reduce((s, q) => s + q[2], 0) / 4 / zScale;
    faces.push({ pts, fill: heightFill(c, mean, lo, hi), stroke, width });
  }
  return faces;
}
// Level curve z = level as segments [[x, y], [x, y]].
export const levelSegments = (f, level, R, n = 60) => contour((x, y) => f(x, y) - level, -R, R, n);
export function drawLevel(ctx, plot, f, level, R, { color, width = 1.5 } = {}) {
  for (const [p, q] of levelSegments(f, level, R)) line(ctx, ...plot.toPx(...p), ...plot.toPx(...q), { color, width });
}
// The same curve lifted to its height in a 3D scene.
export function drawLevel3d(cam, f, level, R, options = {}) {
  for (const [p, q] of levelSegments(f, level, R)) cam.line([p[0], p[1], level], [q[0], q[1], level], options);
}
