import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { boxes, fact, num } from './_is.js';

// e^(−t²) = Σ (−1)ⁿ t²ⁿ/n!. Integrate each term from 0 to x: Σ (−1)ⁿ x²ⁿ⁺¹ / (n!(2n+1)).
// No elementary formula gives this area, but the series does.
const state = { x: 1, N: 4 };
const series = (x, N) => { let s = 0; for (let n = 0; n < N; n++) s += ((n % 2 ? -1 : 1) * x ** (2 * n + 1)) / (fact(n) * (2 * n + 1)); return s; };
// Simpson's rule, as an independent check of the area.
const area = (x) => { const m = 400; const h = x / m; let s = Math.exp(0) + Math.exp(-x * x); for (let i = 1; i < m; i++) s += (i % 2 ? 4 : 2) * Math.exp(-((i * h) ** 2)); return (s * h) / 3; };
const [boxA, boxB] = boxes(2);

createTool({
  state,
  label: 'Top: the bell curve e to the minus t squared with the area from 0 to x shaded. Bottom: the area as a function of x (black) and the polynomial from the first N terms of the integrated series (coral).',
  setup: (stage, c) => ({
    a: createPlot(stage, { x: [0, 3], y: [0, 1.1], c, box: boxA }),
    b: createPlot(stage, { x: [0, 3], y: [0, 1], c, box: boxB }),
  }),
  draw(ctx, stage, c, { a, b }) {
    a.axes({ xLabel: 't', yLabel: 'e^(−t²)' });
    a.shade((t) => Math.exp(-t * t), null, 0, state.x, c.fillA);
    a.fn((t) => Math.exp(-t * t), { color: c.ink, width: 3 });
    b.axes({ xLabel: 'x', yLabel: 'area' });
    b.segment(0, Math.sqrt(Math.PI) / 2, 3, Math.sqrt(Math.PI) / 2, { color: c.c, width: 2, dash: [6, 4] });
    b.fn(area, { color: c.ink, width: 3, domain: [0.001, 3] });
    b.fn((x) => series(x, state.N), { color: c.a, width: 3 });
    b.segment(state.x, 0, state.x, 1, { color: c.b, width: 2, dash: [5, 4] });
  },
  controls: [
    { title: 'Integrate term by term' },
    { key: 'x', label: 'Upper limit x', min: 0.1, max: 2.5, step: 0.1, format: (v) => v.toFixed(1) },
    { key: 'N', label: 'Terms N', min: 1, max: 12, step: 1 },
    { readout: [
      ['Series with N terms', () => num(series(state.x, state.N), 6)],
      ['Area (Simpson check)', () => num(area(state.x), 6)],
      ['Error', () => num(Math.abs(series(state.x, state.N) - area(state.x)), 3)],
      ['Area out to ∞', () => `√π/2 = ${(Math.sqrt(Math.PI) / 2).toFixed(6)}`],
    ] },
  ],
  tex: (s) => `\\int_0^{x}e^{-t^2}dt=\\sum_{n=0}^{${s.N - 1}}\\frac{(-1)^n x^{2n+1}}{n!\\,(2n+1)}`,
});
