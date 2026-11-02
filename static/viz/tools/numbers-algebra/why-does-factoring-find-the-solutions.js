import { plotTool } from '../../lib/recipes.js';
import { fixed } from '../../lib/format.js';

const state = { p: -2, q: 3, x: 0 };
const f = (s, x) => (x - s.p) * (x - s.q);

plotTool({
  state,
  label: 'A parabola for the product of two factors, which crosses zero only where one of the factors is zero. Vertical segments show the sizes of the two factors at the chosen x.',
  x: [-6, 6],
  y: [-10, 20],
  xLabel: 'x',
  yLabel: '(x − p)(x − q)',
  range: () => [[-6, 6], [-10, 20]],
  curves: (s, c) => [[(x) => f(s, x), { color: c.b }]],
  segments: (s, c) => [[s.x, 0, s.p, 0, { color: c.a, width: 5 }], [s.x, -1, s.q, -1, { color: c.c, width: 5 }]],
  points: (s, c) => [[s.p, 0, c.fillA, 7], [s.q, 0, c.fillC, 7], [s.x, f(s, s.x), c.a]],
  controls: [
    { title: 'Two factors' },
    { key: 'p', label: 'Root p', min: -5, max: 5, step: 1 },
    { key: 'q', label: 'Root q', min: -5, max: 5, step: 1 },
    { key: 'x', label: 'x', min: -6, max: 6, step: 0.25 },
    { readout: [
      ['x − p', (s) => fixed(s.x - s.p, 2)],
      ['x − q', (s) => fixed(s.x - s.q, 2)],
      ['Product', (s) => fixed(f(s, s.x), 2)],
      ['Zero?', (s) => ({ text: Math.abs(f(s, s.x)) < 1e-9 ? 'yes: a factor is 0' : 'no', good: true })],
    ] },
  ],
  tex: (s) => `(x-${s.p})(x-${s.q})=${fixed(f(s, s.x), 2)}`,
});
