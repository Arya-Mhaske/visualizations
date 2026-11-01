import { createTool } from '../../lib/tool.js';
import { label, line, poly } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

// Corner A is shared. alpha and beta are fixed by the sliders; the base AB is 6 cm. The copy is scaled about A.
const state = { alpha: 50, beta: 60, k: 1.5 };
const rad = (d) => (d * Math.PI) / 180;
function sides(s = state) {
  const g = 180 - s.alpha - s.beta;
  const c = 6;
  return { a: (c * Math.sin(rad(s.alpha))) / Math.sin(rad(g)), b: (c * Math.sin(rad(s.beta))) / Math.sin(rad(g)), c };
}
// Corners in cm, A at the origin and y up.
function corners(s = state) {
  const { b, c } = sides(s);
  return { A: [0, 0], B: [c, 0], C: [b * Math.cos(rad(s.alpha)), b * Math.sin(rad(s.alpha))] };
}
const ratios = (v) => [v.a / v.b, v.b / v.c, v.a / v.c];
const scaled = (s = state) => Object.fromEntries(Object.entries(sides(s)).map(([key, v]) => [key, v * s.k]));

const tool = createTool({
  state,
  label: 'Two triangles sharing the corner at the left. The small one is outlined, and the enlarged copy is filled. Their matching sides lie along the same lines and the far sides are parallel. Sliders change the two base angles and the scale, and a table shows the side ratios, which stay the same.',
  draw(ctx, stage, c) {
    const { A, B, C } = corners();
    const top = Math.max(C[1], 0.1) * 2;
    const right = Math.max(B[0], C[0]) * 2;
    const left = Math.min(0, C[0]) * 2;
    const u = Math.min((stage.w * 0.86) / (right - left), (stage.h * 0.8) / top);
    const to = ([x, y], k = 1) => [stage.w * 0.07 - left * u + x * k * u, stage.h * 0.9 - y * k * u];
    const big = [A, B, C].map((p) => to(p, state.k));
    const small = [A, B, C].map((p) => to(p));
    poly(ctx, big, { fill: c.fillY, stroke: c.ink, width: 3 });
    poly(ctx, small, { fill: c.fillC, stroke: c.ink, width: 3 });
    const names = [['a', 1, 2], ['b', 2, 0], ['c', 0, 1]];
    const col = { a: c.a, b: c.b, c: c.c };
    for (const [n, i, j] of names) {
      line(ctx, ...small[i], ...small[j], { color: col[n], width: 5 });
      line(ctx, ...big[i], ...big[j], { color: col[n], width: 3, dash: n === 'b' ? [] : [] });
      const mid = (p) => [(p[i][0] + p[j][0]) / 2, (p[i][1] + p[j][1]) / 2];
      const [mx, my] = mid(big);
      label(ctx, `${n}'`, mx + (n === 'c' ? 0 : 12), my + (n === 'c' ? 14 : -4), c, { size: 12, color: col[n], bounds: stage, patch: false });
      const [sx, sy] = mid(small);
      label(ctx, n, sx + (n === 'c' ? 0 : -12), sy + (n === 'c' ? -12 : 4), c, { size: 12, color: col[n], bounds: stage });
    }
    label(ctx, 'The angles never change', 8, 12, c, { size: 11, align: 'left', bounds: stage, patch: false });
  },
  controls: () => [
    { title: 'Lock the angles, change the size' },
    { key: 'k', label: 'Scale factor, k', min: 0.5, max: 2, step: 0.1, format: (n) => `× ${fixed(n, 1)}` },
    { key: 'alpha', label: 'Angle α at the shared corner', min: 30, max: 90, step: 5, format: (n) => `${n}°` },
    { key: 'beta', label: 'Angle β', min: 30, max: 80, step: 5, format: (n) => `${n}°` },
    { readout: [
      ['Small a, b, c', () => { const v = sides(); return `${fixed(v.a, 2)}, ${fixed(v.b, 2)}, ${fixed(v.c, 2)} cm`; }],
      ['Big a′, b′, c′', () => { const v = scaled(); return `${fixed(v.a, 2)}, ${fixed(v.b, 2)}, ${fixed(v.c, 2)} cm`; }],
      ['a : b : c, small', () => ratios(sides()).map((r) => fixed(r, 3)).join(', ')],
      ['a′ : b′ : c′, big', () => ratios(scaled()).map((r) => fixed(r, 3)).join(', ')],
    ] },
    { text: 'The ratios listed are a/b, b/c and a/c.' },
  ],
  tex: (s) => { const v = sides(s); const w = scaled(s); return `\\dfrac{a'}{a}=\\dfrac{${fixed(w.a, 2)}}{${fixed(v.a, 2)}}=\\dfrac{${fixed(w.b, 2)}}{${fixed(v.b, 2)}}=\\dfrac{${fixed(w.c, 2)}}{${fixed(v.c, 2)}}=${fixed(s.k, 1)}`; },
  onChange(s) { if (s.alpha + s.beta > 170) s.beta = 170 - s.alpha; },
});
tool.update();
