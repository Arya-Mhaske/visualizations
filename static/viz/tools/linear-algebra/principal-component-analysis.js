import { createTool } from '../../lib/tool.js';
import { dot } from '../../lib/draw.js';
import { createRng } from '../../lib/rng.js';
import { fixed } from '../../lib/format.js';
import { eig2, rad } from './_la-math.js';
import { plane, vec } from './_la-view.js';

// 60 points: standard normal noise z (fixed by the seed), stretched by σ1 and σ2 and turned by the tilt. Move the sliders and the same cloud reshapes.
const rng = createRng(11);
const Z = Array.from({ length: 60 }, () => {
  const u = Math.max(rng.next(), 1e-9);
  const v = rng.next();
  const r = Math.sqrt(-2 * Math.log(u));
  return [r * Math.cos(2 * Math.PI * v), r * Math.sin(2 * Math.PI * v)];
});
const state = { s1: 2.2, s2: 0.7, tilt: 35, psi: 100 };
const cloud = (s) => Z.map(([a, b]) => {
  const [x, y] = [a * s.s1, b * s.s2];
  const t = rad(s.tilt);
  return [x * Math.cos(t) - y * Math.sin(t), x * Math.sin(t) + y * Math.cos(t)];
}).map((p, _, all) => [p[0] - all.reduce((m, q) => m + q[0], 0) / all.length, p[1] - all.reduce((m, q) => m + q[1], 0) / all.length]);
const cov = (pts) => { const n = pts.length - 1; const sxx = pts.reduce((a, p) => a + p[0] * p[0], 0) / n; const syy = pts.reduce((a, p) => a + p[1] * p[1], 0) / n; const sxy = pts.reduce((a, p) => a + p[0] * p[1], 0) / n; return [[sxx, sxy], [sxy, syy]]; };
const varAlong = (pts, psi) => { const d = [Math.cos(rad(psi)), Math.sin(rad(psi))]; return pts.reduce((a, p) => a + (p[0] * d[0] + p[1] * d[1]) ** 2, 0) / (pts.length - 1); };

createTool({
  state,
  label: 'A cloud of data points centred on the origin, a line through the origin that you can turn, and the foot of the perpendicular from each point onto that line. The spread of those feet along the line is the variance in that direction. It is largest when the line points along the long axis of the cloud, which is the first principal component, the top eigenvector of the covariance matrix.',
  setup: (stage, c) => plane(stage, c, 5),
  draw(ctx, stage, c, plot) {
    const pts = cloud(state);
    const d = [Math.cos(rad(state.psi)), Math.sin(rad(state.psi))];
    const e = eig2(cov(pts));
    plot.axes({ grid: false });
    plot.segment(-8 * e.v[0][0], -8 * e.v[0][1], 8 * e.v[0][0], 8 * e.v[0][1], { color: c.c, width: 2, dash: [6, 5] });
    plot.segment(-8 * d[0], -8 * d[1], 8 * d[0], 8 * d[1], { color: c.ink, width: 3 });
    for (const p of pts) {
      const k = p[0] * d[0] + p[1] * d[1];
      plot.segment(p[0], p[1], k * d[0], k * d[1], { color: c.grid, width: 1 });
      dot(ctx, ...plot.toPx(...p), 4, c.fillY, c.ink, 1);
      dot(ctx, ...plot.toPx(k * d[0], k * d[1]), 3, c.fillA, c.ink, 1);
    }
    vec(ctx, plot, c, [0, 0], d.map((v) => v * 2.5), { color: c.a, width: 5 });
  },
  controls: [
    { title: 'Find the direction of most spread' },
    { key: 'psi', label: 'Direction of the line', min: 0, max: 175, step: 5, format: (n) => `${n}°` },
    { key: 's1', label: 'Long spread', min: 1, max: 3, step: 0.2, format: (n) => fixed(n, 1) },
    { key: 's2', label: 'Short spread', min: 0.3, max: 1.5, step: 0.1, format: (n) => fixed(n, 1) },
    { key: 'tilt', label: 'Tilt of the cloud', min: 0, max: 175, step: 5, format: (n) => `${n}°` },
    { readout: [
      ['Variance along the line', (s) => fixed(varAlong(cloud(s), s.psi), 3)],
      ['Largest possible (λ₁)', (s) => ({ text: fixed(eig2(cov(cloud(s))).l[0], 3), good: true })],
      ['Direction of PC1', (s) => { const v = eig2(cov(cloud(s))).v[0]; return `${fixed(((Math.atan2(v[1], v[0]) * 180) / Math.PI + 180) % 180, 1)}°`; }],
      ['Share of all variance in PC1', (s) => { const l = eig2(cov(cloud(s))).l; return `${fixed((l[0] / (l[0] + l[1])) * 100, 1)}%`; }],
    ] },
  ],
  tex: () => 'S=\\dfrac{1}{n-1}\\sum \\mathbf x_i\\mathbf x_i^{\\mathsf T},\\qquad \\text{PC1 = top eigenvector of }S',
});
