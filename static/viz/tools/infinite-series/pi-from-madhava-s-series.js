import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { boxes, speck, num } from './_is.js';

// Slow: π/4 = 1 − 1/3 + 1/5 − …   Fast: π = √12 (1 − 1/(3·3) + 1/(5·3²) − …), the same arctan series at x = 1/√3.
const slow = (N) => { let s = 0; for (let k = 0; k < N; k++) s += ((k % 2) ? -1 : 1) / (2 * k + 1); return 4 * s; };
const fast = (N) => { let s = 0; for (let k = 0; k < N; k++) s += ((k % 2) ? -1 : 1) / ((2 * k + 1) * 3 ** k); return Math.sqrt(12) * s; };
const digits = (v) => Math.min(15, -Math.log10(Math.abs(v - Math.PI) || 1e-16));
const NMAX = 30;
const state = { N: 5 };
const [boxA, boxB] = boxes(2);

createTool({
  state,
  label: 'Top: the estimate of pi after N terms for the slow series (coral) and the fast series (blue). Bottom: how many correct decimal places each has.',
  setup: (stage, c) => ({
    a: createPlot(stage, { x: [0, NMAX + 1], y: [2.8, 3.5], c, box: boxA }),
    b: createPlot(stage, { x: [0, NMAX + 1], y: [0, 16], c, box: boxB }),
  }),
  draw(ctx, stage, c, { a, b }) {
    a.axes({ xLabel: 'N', yLabel: 'estimate' });
    a.segment(0, Math.PI, NMAX + 1, Math.PI, { color: c.c, width: 3, dash: [7, 4] });
    b.axes({ xLabel: 'N', yLabel: 'correct places' });
    for (let n = 1; n <= NMAX; n++) {
      const here = n === state.N ? 6 : 3.5;
      speck(ctx, a, n, slow(n), here, c.a, c.ink);
      speck(ctx, a, n, fast(n), here, c.b, c.ink);
      speck(ctx, b, n, digits(slow(n)), here, c.a, c.ink);
      speck(ctx, b, n, digits(fast(n)), here, c.b, c.ink);
    }
  },
  controls: [
    { title: 'Add terms' },
    { key: 'N', label: 'Terms N', min: 1, max: NMAX, step: 1 },
    { readout: [
      ['π', () => String(Math.PI)],
      ['Slow series', () => slow(state.N).toFixed(8)],
      ['Fast series', () => fast(state.N).toFixed(12)],
      ['Correct places (slow, fast)', () => `${Math.floor(digits(slow(state.N)))} and ${Math.floor(digits(fast(state.N)))}`],
      ['Error of slow series', () => num(Math.abs(slow(state.N) - Math.PI), 3)],
    ] },
  ],
  tex: () => '\\frac{\\pi}{4}=1-\\frac13+\\frac15-\\cdots\\qquad \\pi=\\sqrt{12}\\left(1-\\frac{1}{3\\cdot 3}+\\frac{1}{5\\cdot 3^2}-\\cdots\\right)',
});
