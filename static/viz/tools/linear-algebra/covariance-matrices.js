import { createTool } from '../../lib/tool.js';
import { dot } from '../../lib/draw.js';
import { createRng } from '../../lib/rng.js';
import { fixed } from '../../lib/format.js';
import { bmat, eig2 } from './_la-math.js';
import { circlePts, curve, plane } from './_la-view.js';

// 120 pairs (x, y): z1 and z2 are fixed normal draws; x = σx z1 and y = σy (ρ z1 + √(1−ρ²) z2). The slider changes how they move together.
const rng = createRng(5);
const Z = Array.from({ length: 120 }, () => {
  const u = Math.max(rng.next(), 1e-9);
  const v = rng.next();
  const r = Math.sqrt(-2 * Math.log(u));
  return [r * Math.cos(2 * Math.PI * v), r * Math.sin(2 * Math.PI * v)];
});
const state = { sx: 1.6, sy: 1.1, rho: 0.7 };
const data = (s) => Z.map(([a, b]) => [s.sx * a, s.sy * (s.rho * a + Math.sqrt(1 - s.rho * s.rho) * b)]);
const target = (s) => [[s.sx * s.sx, s.rho * s.sx * s.sy], [s.rho * s.sx * s.sy, s.sy * s.sy]];
function sample(pts) {
  const n = pts.length;
  const mx = pts.reduce((a, p) => a + p[0], 0) / n;
  const my = pts.reduce((a, p) => a + p[1], 0) / n;
  const sxx = pts.reduce((a, p) => a + (p[0] - mx) ** 2, 0) / (n - 1);
  const syy = pts.reduce((a, p) => a + (p[1] - my) ** 2, 0) / (n - 1);
  const sxy = pts.reduce((a, p) => a + (p[0] - mx) * (p[1] - my), 0) / (n - 1);
  return [[sxx, sxy], [sxy, syy]];
}

createTool({
  state,
  label: 'A cloud of paired measurements, with the ellipse that the covariance matrix describes drawn over it. The ellipse axes point along the eigenvectors of the covariance matrix, and their lengths are the square roots of the eigenvalues. When the two measurements rise together the ellipse leans and the off-diagonal entry is positive. When they are unrelated it lines up with the axes.',
  setup: (stage, c) => plane(stage, c, 5),
  draw(ctx, stage, c, plot) {
    const S = target(state);
    const e = eig2(S);
    plot.axes();
    for (const p of data(state)) dot(ctx, ...plot.toPx(...p), 3, c.fillY, c.ink, 1);
    for (const k of [1, 2]) {
      const pts = circlePts().map(([u, w]) => [k * (Math.sqrt(e.l[0]) * u * e.v[0][0] + Math.sqrt(e.l[1]) * w * e.v[1][0]), k * (Math.sqrt(e.l[0]) * u * e.v[0][1] + Math.sqrt(e.l[1]) * w * e.v[1][1])]);
      curve(ctx, plot, pts, [[1, 0], [0, 1]], { color: k === 1 ? c.a : c.grid, width: k === 1 ? 4 : 2, closed: true });
    }
    for (const [i, color] of [[0, c.a], [1, c.b]]) plot.segment(-3 * Math.sqrt(e.l[i]) * e.v[i][0], -3 * Math.sqrt(e.l[i]) * e.v[i][1], 3 * Math.sqrt(e.l[i]) * e.v[i][0], 3 * Math.sqrt(e.l[i]) * e.v[i][1], { color, width: 2 });
  },
  controls: [
    { title: 'How two measurements vary together' },
    { key: 'rho', label: 'Correlation ρ', min: -0.95, max: 0.95, step: 0.05, format: (n) => fixed(n, 2) },
    { key: 'sx', label: 'Spread of x', min: 0.5, max: 2.5, step: 0.1, format: (n) => fixed(n, 1) },
    { key: 'sy', label: 'Spread of y', min: 0.5, max: 2.5, step: 0.1, format: (n) => fixed(n, 1) },
    { readout: [
      ['Covariance entries (sample)', (s) => { const m = sample(data(s)); return `${fixed(m[0][0], 2)}, ${fixed(m[0][1], 2)}, ${fixed(m[1][1], 2)}`; }],
      ['Covariance entries (target)', (s) => { const m = target(s); return `${fixed(m[0][0], 2)}, ${fixed(m[0][1], 2)}, ${fixed(m[1][1], 2)}`; }],
      ['Eigenvalues (target)', (s) => eig2(target(s)).l.map((v) => fixed(v, 2)).join(', ')],
    ] },
  ],
  tex: (s) => `\\Sigma=${bmat(target(s), (v) => fixed(v, 2))},\\quad \\rho=\\dfrac{\\Sigma_{12}}{\\sqrt{\\Sigma_{11}\\Sigma_{22}}}=${fixed(s.rho, 2)}`,
});
