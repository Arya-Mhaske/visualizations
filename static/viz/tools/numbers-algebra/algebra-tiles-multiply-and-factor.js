import { createTool } from '../../lib/tool.js';
import { box } from '../../lib/quick.js';
import { label } from '../../lib/draw.js';
import { tileFactors } from './_poly.js';

const state = { a: 1, b: 5, c: 6 };

createTool({
  state,
  label: 'Algebra tiles for the chosen expression. If a rectangle is possible the tiles are drawn in place with the factors written on its sides; otherwise they are drawn in a heap and the expression does not factor over whole numbers.',
  draw(ctx, stage, c) {
    const f = tileFactors(state.a, state.b, state.c);
    const X = Math.min(stage.w, stage.h) * 0.2;
    if (!f) {
      for (let i = 0; i < state.a; i++) box(ctx, c, 20 + i * (X + 6), 40, X, X, c.fillA, 'x²');
      for (let i = 0; i < state.b; i++) box(ctx, c, 20 + i * (X * 0.35 + 6), 50 + X, X * 0.35, X, c.fillB, 'x');
      for (let i = 0; i < state.c; i++) box(ctx, c, 20 + i * 18, 70 + 2 * X, 14, 14, c.fillC, '');
      label(ctx, 'no rectangle: does not factor', stage.w / 2, stage.h - 20, c, { size: 14, bounds: stage, patch: false });
      return;
    }
    const { m, n, p, q } = f;
    const u = X * 0.4;
    const [W, H] = [m * X + p * u, n * X + q * u];
    const [x0, y0] = [(stage.w - W) / 2, 40];
    for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) box(ctx, c, x0 + i * X, y0 + j * X, X, X, c.fillA, 'x²');
    for (let i = 0; i < p; i++) for (let j = 0; j < n; j++) box(ctx, c, x0 + m * X + i * u, y0 + j * X, u, X, c.fillB, '');
    for (let i = 0; i < m; i++) for (let j = 0; j < q; j++) box(ctx, c, x0 + i * X, y0 + n * X + j * u, X, u, c.fillB, '');
    for (let i = 0; i < p; i++) for (let j = 0; j < q; j++) box(ctx, c, x0 + m * X + i * u, y0 + n * X + j * u, u, u, c.fillC, '');
    label(ctx, `width: ${m === 1 ? '' : m}x + ${p}`, x0 + W / 2, y0 - 14, c, { size: 13, bounds: stage, patch: false });
    label(ctx, `height: ${n === 1 ? '' : n}x + ${q}`, stage.w / 2, y0 + H + 20, c, { size: 13, bounds: stage, patch: false });
  },
  controls: [
    { title: 'ax² + bx + c' },
    { key: 'a', label: 'a (x² tiles)', min: 1, max: 4, step: 1 },
    { key: 'b', label: 'b (x tiles)', min: 1, max: 12, step: 1 },
    { key: 'c', label: 'c (unit tiles)', min: 1, max: 12, step: 1 },
    { readout: [['Factors', (s) => { const f = tileFactors(s.a, s.b, s.c); return f ? `(${f.m === 1 ? '' : f.m}x + ${f.p})(${f.n === 1 ? '' : f.n}x + ${f.q})` : 'none over the whole numbers'; }]] },
  ],
  tex: (s) => `${s.a === 1 ? '' : s.a}x^2+${s.b}x+${s.c}`,
});
