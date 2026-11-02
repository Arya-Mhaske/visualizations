import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { num } from '../integral-applications/_ia.js';

// f(x) = (a x² + b x + 1)/(d x² + e x + 4). Divide top and bottom by x²: (a + b/x + 1/x²)/(d + e/x + 4/x²). The /x terms fade.
const state = { a: 3, b: 6, d: 2, e: -4, x: 10 };
const f = (x) => (state.a * x * x + state.b * x + 1) / (state.d * x * x + state.e * x + 4);
const top = (x) => state.a + state.b / x + 1 / (x * x);
const bot = (x) => state.d + state.e / x + 4 / (x * x);
const L = () => state.a / state.d;

createTool({
  state,
  label: 'A rational function and its horizontal asymptote, which is the ratio of the leading coefficients. A marker at x shows the value, and the readouts show the other terms fading as x grows.',
  setup: (stage, c) => createPlot(stage, { x: [0, 20], y: [0, 5], c }),
  draw(ctx, stage, c, plot) {
    const X = Math.max(20, state.x * 1.3);
    const l = L();
    plot.setRange([0.1, X], [l - 3, l + 3]);
    plot.axes({ xLabel: 'x', yLabel: 'f' });
    plot.fn(f, { color: c.ink, width: 3, domain: [0.1, X] });
    plot.segment(0, l, X, l, { color: c.c, width: 3, dash: [7, 4] });
    plot.point(state.x, Math.max(l - 3, Math.min(l + 3, f(state.x))), { fill: c.a });
  },
  controls: [
    { title: 'Change the terms' },
    { key: 'a', label: 'Leading coefficient on top a', min: 1, max: 6, step: 1 },
    { key: 'd', label: 'Leading coefficient below d', min: 1, max: 6, step: 1 },
    { key: 'b', label: 'Middle term on top b', min: -10, max: 10, step: 1 },
    { key: 'e', label: 'Middle term below e', min: -4, max: 6, step: 1 },
    { key: 'x', label: 'Far out: x =', min: 5, max: 500, step: 5 },
    { readout: [
      ['f(x)', () => num(f(state.x), 5)],
      ['Top ÷ x²  →  a', () => `${num(top(state.x), 5)}  (b/x = ${num(state.b / state.x, 3)})`],
      ['Bottom ÷ x²  →  d', () => `${num(bot(state.x), 5)}  (e/x = ${num(state.e / state.x, 3)})`],
      ['Asymptote a / d', () => num(L(), 5)],
    ] },
  ],
  tex: (s) => `\\frac{ax^2+bx+1}{dx^2+ex+4}=\\frac{a+b/x+1/x^2}{d+e/x+4/x^2}\\to\\frac{${s.a}}{${s.d}}`,
});
