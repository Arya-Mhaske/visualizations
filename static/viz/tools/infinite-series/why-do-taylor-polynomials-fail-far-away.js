import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { boxes, speck, num } from './_is.js';
import { FN, taylor } from './_taylor.js';

// Top: f and Tₙ. Bottom: Tₖ(x) at the chosen x as k grows: it homes in on f(x) inside the radius, and runs away outside.
const state = { fn: 'ln', n: 8, x: 1.4 };
const K = () => FN[state.fn];
const KMAX = 30;
const [boxA, boxB] = boxes(2);
const domainOk = (x) => state.fn !== 'ln' || x > -1;

createTool({
  state,
  label: 'Top: a function in black and its Taylor polynomial in coral. Bottom: the values of the polynomials of degree 1 to 30 at one chosen x, against the true value as a line.',
  setup: (stage, c) => ({
    a: createPlot(stage, { x: [-1, 3], y: [-4, 2.5], c, box: boxA }),
    b: createPlot(stage, { x: [0, KMAX + 1], y: [-2, 2], c, box: boxB }),
  }),
  draw(ctx, stage, c, { a, b }) {
    const x = Math.max(K().win[0] + 0.01, state.x);
    a.setRange(K().win, K().y);
    a.axes({ xLabel: 'x', yLabel: 'y' });
    if (Number.isFinite(K().R)) a.shade(() => K().y[1], () => K().y[0], Math.max(-K().R, K().win[0]), K().R, c.fillC);
    a.fn(K().f, { color: c.ink, width: 3 });
    a.fn((t) => taylor(state.fn, state.n, 0, t), { color: c.a, width: 3 });
    a.segment(x, K().y[0], x, K().y[1], { color: c.b, width: 2, dash: [5, 4] });
    const fx = K().f(x);
    b.setRange([0, KMAX + 1], [fx - 1.5, fx + 1.5]);
    b.axes({ xLabel: 'degree k', yLabel: 'Tₖ(x)' });
    b.segment(0, fx, KMAX + 1, fx, { color: c.c, width: 3, dash: [7, 4] });
    for (let k = 1; k <= KMAX; k++) speck(ctx, b, k, Math.max(fx - 1.6, Math.min(fx + 1.6, taylor(state.fn, k, 0, x))), k === state.n ? 6 : 3.5, k === state.n ? c.a : c.b, c.ink);
  },
  controls: [
    { title: 'Reach past the radius' },
    { key: 'fn', label: 'Function', options: [['ln', 'ln(1 + x)'], ['rat', '1/(1 + x²)'], ['exp', 'eˣ']] },
    { key: 'n', label: 'Degree n', min: 1, max: KMAX, step: 1 },
    { key: 'x', label: 'x', min: -0.9, max: 2.5, step: 0.05, format: (v) => v.toFixed(2).replace('-', '−') },
    { readout: [
      ['f(x)', () => num(K().f(state.x), 5)],
      ['Tₙ(x)', () => num(taylor(state.fn, state.n, 0, state.x), 5)],
      ['T₃₀(x)', () => num(taylor(state.fn, KMAX, 0, state.x), 5)],
      ['Radius', () => (Number.isFinite(K().R) ? `${K().R}, set by a trouble spot at distance 1` : '∞')],
      ['This x is', () => (Math.abs(state.x) < K().R ? { text: 'inside: converges', good: true } : Math.abs(state.x) === K().R ? 'on the edge: check the endpoint' : { text: 'outside: diverges', good: false })],
    ] },
  ],
  tex: (s) => `|x|<R\\ \\Rightarrow\\ T_n(x)\\to f(x);\\quad x=${s.x.toFixed(2)}`,
});
