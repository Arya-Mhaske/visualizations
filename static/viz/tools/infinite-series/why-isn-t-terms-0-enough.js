import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { boxes, partials, zeta, speck, trace, num } from './_is.js';

// Terms 1/nᵖ always go to 0. Only for p > 1 do the partial sums stop growing.
const state = { p: 1, N: 1000 };
const [boxA, boxB] = boxes(2);
const cache = {};
function sums() {
  const key = `${state.p}`;
  if (!cache[key]) cache[key] = partials((n) => n ** -state.p, 1, 2000);
  return cache[key];
}
const limit = () => (state.p > 1 ? zeta(state.p) : Infinity);

createTool({
  state,
  label: 'Top: the terms 1 over n to the p, falling towards zero. Bottom: the running total of those terms, which levels off for p above 1 and keeps climbing for p of 1 or less.',
  setup: (stage, c) => ({
    a: createPlot(stage, { x: [0, 2000], y: [0, 1], c, box: boxA }),
    b: createPlot(stage, { x: [0, 2000], y: [0, 10], c, box: boxB }),
  }),
  draw(ctx, stage, c, { a, b }) {
    const s = sums();
    const top = Math.max(2, Math.min(40, Math.max(s[state.N - 1], Number.isFinite(limit()) ? limit() : 0) * 1.15));
    a.setRange([0, state.N], [0, 1.1]);
    b.setRange([0, state.N], [0, top]);
    a.axes({ xLabel: 'n', yLabel: 'term aₙ' });
    a.fn((x) => (x < 1 ? 1 : x ** -state.p), { color: c.a, width: 3, domain: [1, state.N] });
    b.axes({ xLabel: 'n', yLabel: 'sum Sₙ' });
    const step = Math.max(1, Math.floor(state.N / 200));
    const pts = [];
    for (let n = 1; n <= state.N; n += step) pts.push([n, s[n - 1]]);
    trace(ctx, b, pts, c.b, 3);
    if (Number.isFinite(limit())) b.segment(0, limit(), state.N, limit(), { color: c.c, width: 3, dash: [7, 4] });
    speck(ctx, b, state.N, s[state.N - 1], 5, c.a, c.ink);
  },
  controls: [
    { title: 'Terms that shrink' },
    { key: 'p', label: 'Exponent p', min: 0.5, max: 3, step: 0.1, format: (v) => v.toFixed(1) },
    { key: 'N', label: 'Terms added N', min: 10, max: 2000, step: 10 },
    { readout: [
      ['Last term aₙ', () => num(state.N ** -state.p, 5)],
      ['Total Sₙ', () => num(sums()[state.N - 1], 4)],
      ['Where it ends', () => (Number.isFinite(limit()) ? { text: `settles at ${num(limit(), 4)}`, good: true } : { text: 'grows without bound', good: false })],
    ] },
  ],
  tex: (s) => `\\sum_{n=1}^{\\infty}\\frac{1}{n^{${s.p.toFixed(1)}}}\\quad a_n\\to 0\\ \\text{always}`,
});
