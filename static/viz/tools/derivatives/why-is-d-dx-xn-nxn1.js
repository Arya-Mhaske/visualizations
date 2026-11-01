import { createTool } from '../../lib/tool.js';
import { label, poly } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

const state = { n: 2, x: 3, dx: 0.5 };
const C = [1, 1, 2, 3, 4, 5];
const binom = (n, k) => { let r = 1; for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i; return r; };
// the n pieces of (x + dx)^n − x^n: C(n,k) x^(n−k) dx^k for k = 1..n
const pieces = (s = state) => Array.from({ length: s.n }, (_, i) => binom(s.n, i + 1) * s.x ** (s.n - 1 - i) * s.dx ** (i + 1));
const total = (s = state) => pieces(s).reduce((a, b) => a + b, 0);

createTool({
  state,
  label: 'For a square of side x grown to side x plus dx, the new area is two thin strips and a tiny corner. The strips are each about x times dx and the corner is dx squared, which is much smaller. For higher powers a bar chart shows the pieces of the growth: the first piece, n times x to the n minus 1 times dx, is almost all of it when dx is small.',
  draw(ctx, stage, c) {
    const { x, dx, n } = state;
    if (n === 2) {
      const k = (Math.min(stage.w, stage.h) * 0.7) / (x + dx);
      const [x0, y0] = [stage.w * 0.12, stage.h * 0.12];
      const r = (u, v, w, h, fill) => poly(ctx, [[x0 + u * k, y0 + v * k], [x0 + (u + w) * k, y0 + v * k], [x0 + (u + w) * k, y0 + (v + h) * k], [x0 + u * k, y0 + (v + h) * k]], { fill, stroke: c.ink, width: 2 });
      r(0, 0, x, x, c.fillB);
      r(x, 0, dx, x, c.fillA);
      r(0, x, x, dx, c.fillA);
      r(x, x, dx, dx, c.fillY);
      label(ctx, 'x²', x0 + (x * k) / 2, y0 + (x * k) / 2, c, { size: 13, bounds: stage, patch: false });
      label(ctx, 'x·dx', x0 + (x + dx / 2) * k + 18, y0 + (x * k) / 2, c, { size: 10, bounds: stage, patch: false });
      label(ctx, 'x·dx', x0 + (x * k) / 2, y0 + (x + dx / 2) * k + 14, c, { size: 10, bounds: stage, patch: false });
      label(ctx, 'dx² (tiny)', x0 + (x + dx) * k - 20, y0 + (x + dx) * k + 24, c, { size: 10, bounds: stage, patch: false });
    } else {
      const P = pieces();
      const k = (stage.w * 0.8) / total();
      let u = stage.w * 0.1;
      P.forEach((v, i) => {
        poly(ctx, [[u, stage.h * 0.3], [u + v * k, stage.h * 0.3], [u + v * k, stage.h * 0.5], [u, stage.h * 0.5]], { fill: [c.fillA, c.fillB, c.fillC, c.fillY][i % 4], stroke: c.ink, width: 2 });
        label(ctx, `${fixed(v, 3)}`, u + (v * k) / 2, stage.h * 0.6 + (i % 2) * 16, c, { size: 10, bounds: stage, patch: false });
        u += v * k;
      });
      label(ctx, `the growth of x^${n}, in pieces`, stage.w / 2, stage.h * 0.2, c, { size: 12, bounds: stage });
    }
  },
  controls: [
    { title: 'Grow x by dx' },
    { key: 'n', label: 'Power, n', min: 2, max: 5, step: 1 },
    { key: 'x', label: 'Side, x', min: 1, max: 4, step: 0.5 },
    { key: 'dx', label: 'Growth, dx', min: 0.05, max: 1, step: 0.05 },
    { readout: [
      ['Actual growth', (s) => fixed(total(s), 4)],
      ['First piece, n·xⁿ⁻¹·dx', (s) => fixed(s.n * s.x ** (s.n - 1) * s.dx, 4)],
      ['Share of the growth', (s) => ({ text: `${fixed((100 * s.n * s.x ** (s.n - 1) * s.dx) / total(s), 1)}%`, good: true })],
    ] },
  ],
  tex: (s) => `\\dfrac{(x+dx)^{${s.n}}-x^{${s.n}}}{dx}\\approx ${s.n}x^{${s.n - 1}}=${fixed(s.n * s.x ** (s.n - 1), 3)}`,
});
