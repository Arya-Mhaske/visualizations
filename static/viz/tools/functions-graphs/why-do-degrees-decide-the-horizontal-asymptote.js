import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

// f(x) = (a x^m + 2) / (b x^n + 1)
const state = { m: 2, n: 2, a: 3, b: 2 };
const f = (s, x) => (s.a * x ** s.m + 2) / (s.b * x ** s.n + 1);
const asym = (s) => (s.m < s.n ? 0 : s.m === s.n ? s.a / s.b : null);

createTool({
  state,
  label: 'The graph of a fraction with a power of x on top and a power of x on the bottom. For large x the biggest powers dominate, so the fraction behaves like the ratio of the leading terms. If the top has the smaller degree, the fraction goes to 0. If the degrees are equal, it goes to the ratio of the leading coefficients. If the top has the larger degree, it grows without bound and there is no horizontal asymptote. Values at x equal to 10, 100 and 1000 show the race.',
  setup: (stage, c) => createPlot(stage, { x: [-12, 12], y: [-6, 6], c, pad: 18 }),
  draw(ctx, stage, c, plot) {
    plot.axes();
    plot.fn((x) => f(state, x), { color: c.a, width: 4 });
    const h = asym(state);
    if (h !== null) plot.segment(-12, h, 12, h, { color: c.b, width: 3, dash: [6, 5] });
  },
  controls: [
    { title: 'Choose the degrees' },
    { key: 'm', label: 'Degree on top, m', min: 0, max: 4, step: 1 },
    { key: 'n', label: 'Degree on the bottom, n', min: 0, max: 4, step: 1 },
    { key: 'a', label: 'Leading coefficient on top, a', min: 1, max: 6, step: 1 },
    { key: 'b', label: 'Leading coefficient on the bottom, b', min: 1, max: 6, step: 1 },
    { readout: [
      ['Values at x = 10, 100, 1000', (s) => [10, 100, 1000].map((x) => fixed(f(s, x), 3)).join(', ')],
      ['Horizontal asymptote', (s) => (asym(s) === null ? 'none: it grows without bound' : `y = ${fixed(asym(s), 3)}`)],
      ['Rule', (s) => (s.m < s.n ? 'm < n: y = 0' : s.m === s.n ? 'm = n: y = a ÷ b' : 'm > n: none')],
    ] },
  ],
  tex: (s) => `f(x)=\\dfrac{${s.a}x^{${s.m}}+2}{${s.b}x^{${s.n}}+1}\\ \\sim\\ \\dfrac{${s.a}x^{${s.m}}}{${s.b}x^{${s.n}}}`,
});
