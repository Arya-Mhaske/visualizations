import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { boxes, binom, num } from './_is.js';

// C(k, n) = k(k−1)…(k−n+1)/n!. For whole k ≥ 0 one factor is k − k = 0, so the row stops. For any other k it never does.
const state = { k: 0.5, N: 4, x: 0.5 };
const NMAX = 12;
const poly = (x, N) => { let s = 0; for (let n = 0; n <= N; n++) s += binom(state.k, n) * x ** n; return s; };
const stops = () => Number.isInteger(state.k) && state.k >= 0;
const [boxA, boxB] = boxes(2);

createTool({
  state,
  label: 'Top: bars for the binomial coefficients C of k and n for n from 0 to 12. Bottom: the curve one plus x to the k and the polynomial from the first N terms of the series.',
  setup: (stage, c) => ({
    a: createPlot(stage, { x: [-0.5, NMAX + 0.5], y: [-3, 3], c, box: boxA }),
    b: createPlot(stage, { x: [-1, 1], y: [0, 3], c, box: boxB }),
  }),
  draw(ctx, stage, c, { a, b }) {
    const vals = Array.from({ length: NMAX + 1 }, (_, n) => binom(state.k, n));
    const m = Math.max(1, ...vals.map(Math.abs));
    a.setRange([-0.5, NMAX + 0.5], [-m * 1.15, m * 1.15]);
    a.axes({ xLabel: 'n', yLabel: 'C(k, n)' });
    vals.forEach((v, n) => {
      const [x1, y1] = a.toPx(n - 0.3, v);
      const [x2, y2] = a.toPx(n + 0.3, 0);
      ctx.fillStyle = Math.abs(v) < 1e-12 ? c.fillC : v > 0 ? c.fillA : c.fillB;
      ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
      ctx.strokeStyle = c.ink;
      ctx.lineWidth = 2;
      ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
      if (Math.abs(v) < 1e-12) a.text('0', n, m * 0.2, { color: c.c, size: 12 });
    });
    const f = (x) => (1 + x) ** state.k;
    const top = Math.max(2, Math.min(8, f(-0.9) > 8 ? 8 : Math.max(f(-0.9), f(0.99)) * 1.1));
    b.setRange([-1, 1], [0, top]);
    b.axes({ xLabel: 'x', yLabel: 'y' });
    b.fn(f, { color: c.ink, width: 3, domain: [-0.999, 1] });
    b.fn((x) => poly(x, state.N), { color: c.a, width: 3 });
    b.segment(state.x, 0, state.x, top, { color: c.b, width: 2, dash: [5, 4] });
  },
  controls: [
    { title: 'Choose the power k' },
    { key: 'k', label: 'Power k', min: -3, max: 8, step: 0.5, format: (v) => v.toFixed(1).replace('-', '−') },
    { key: 'N', label: 'Terms up to xᴺ', min: 1, max: NMAX, step: 1 },
    { key: 'x', label: 'x', min: -0.9, max: 0.9, step: 0.05, format: (v) => v.toFixed(2).replace('-', '−') },
    { readout: [
      ['The row', () => (stops() ? { text: `stops after n = ${state.k}`, good: true } : { text: 'never reaches 0: goes on forever', good: false })],
      ['(1 + x)ᵏ', () => num((1 + state.x) ** state.k, 5)],
      ['Series up to xᴺ', () => num(poly(state.x, state.N), 5)],
      ['C(k, N)', () => num(binom(state.k, state.N), 4)],
    ] },
  ],
  tex: (s) => `(1+x)^{${s.k}}=\\sum_{n}\\binom{${s.k}}{n}x^n,\\quad \\binom{k}{n}=\\frac{k(k-1)\\cdots(k-n+1)}{n!}`,
});
