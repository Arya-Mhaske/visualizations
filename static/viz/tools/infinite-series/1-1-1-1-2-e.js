import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { boxes, speck, sumTo, fact, num } from './_is.js';

// 1 + 1/1! + 1/2! + … : each term is the last divided by a growing n, so the sum closes in on e very fast.
// Compare with (1 + 1/n)ⁿ, the compound-interest route to e.
const NMAX = 20;
const S = (N) => sumTo((k) => 1 / fact(k), 0, N);
const comp = (n) => (1 + 1 / n) ** n;
const digits = (v) => Math.min(15, Math.max(0, -Math.log10(Math.abs(v - Math.E) || 1e-16)));
const state = { N: 6 };
const [boxA, boxB] = boxes(2);

createTool({
  state,
  label: 'Top: bars for the terms 1 over k factorial, which shrink very quickly. Bottom: how many correct decimal places of e the series has after N terms, against the compound-interest formula.',
  setup: (stage, c) => ({
    a: createPlot(stage, { x: [-0.5, NMAX + 0.5], y: [0, 1.1], c, box: boxA }),
    b: createPlot(stage, { x: [0, NMAX + 1], y: [0, 16], c, box: boxB }),
  }),
  draw(ctx, stage, c, { a, b }) {
    a.axes({ xLabel: 'k', yLabel: '1/k!' });
    for (let k = 0; k <= NMAX; k++) {
      const [x1, y1] = a.toPx(k - 0.3, 1 / fact(k));
      const [x2, y2] = a.toPx(k + 0.3, 0);
      ctx.fillStyle = k <= state.N ? c.fillA : c.fillB;
      ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
    }
    b.axes({ xLabel: 'N', yLabel: 'correct places' });
    for (let n = 1; n <= NMAX; n++) {
      const big = n === state.N ? 6 : 3.5;
      speck(ctx, b, n, digits(S(n)), big, c.a, c.ink);
      speck(ctx, b, n, digits(comp(n)), big, c.b, c.ink);
    }
  },
  controls: [
    { title: 'Add the terms' },
    { key: 'N', label: 'Terms up to 1/N!', min: 1, max: NMAX, step: 1 },
    { readout: [
      ['Series sum', () => S(state.N).toFixed(12)],
      ['e', () => String(Math.E)],
      ['Error', () => num(Math.abs(Math.E - S(state.N)), 3)],
      ['(1 + 1/N)ᴺ', () => comp(state.N).toFixed(8)],
    ] },
  ],
  tex: (s) => `\\sum_{k=0}^{${s.N}}\\frac1{k!}=${S(s.N).toFixed(8)}\\ \\to\\ e`,
});
