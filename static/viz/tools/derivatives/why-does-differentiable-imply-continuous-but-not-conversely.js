import { plotTool } from '../../lib/recipes.js';
import { fixed } from '../../lib/format.js';

const FN = { smooth: ['Smooth: x²', (x) => x * x, true, true], corner: ['Corner: |x|', Math.abs, true, false], jump: ['Jump: step', (x) => (x < 0 ? 0 : 1), false, false] };
const state = { f: 'smooth', h: 0.5 };
const f = (s) => FN[s.f][1];

plotTool({
  state,
  label: 'The graph of the chosen function near zero with chords to a point on each side, and an open or closed dot to show the value at zero.',
  x: [-2, 2],
  y: [-0.5, 2],
  range: () => [[-1.6, 1.6], [-0.4, 2.2]],
  curves: (s, c) => [[(x) => (s.f === 'jump' && x === 0 ? NaN : f(s)(x)), { color: c.b }]],
  segments: (s, c) => [[0, f(s)(0), s.h, f(s)(s.h), { color: c.a, width: 3 }], [0, f(s)(0), -s.h, f(s)(-s.h), { color: c.c, width: 3 }]],
  points: (s, c) => [[0, f(s)(0), c.ink, 6], [s.h, f(s)(s.h), c.a], [-s.h, f(s)(-s.h), c.c]],
  controls: [
    { title: 'At x = 0' },
    { key: 'f', label: 'Function', options: Object.entries(FN).map(([k, v]) => [k, v[0]]) },
    { key: 'h', label: 'Chord distance h', min: 0.02, max: 1.5, step: 0.02 },
    { readout: [
      ['Continuous at 0?', (s) => ({ text: FN[s.f][2] ? 'yes' : 'no', good: FN[s.f][2] })],
      ['Differentiable at 0?', (s) => ({ text: FN[s.f][3] ? 'yes' : 'no', good: FN[s.f][3] })],
      ['Right | left slope', (s) => `${fixed((f(s)(s.h) - f(s)(0)) / s.h, 2)} | ${fixed((f(s)(-s.h) - f(s)(0)) / -s.h, 2)}`],
    ] },
  ],
  tex: () => `\\text{differentiable}\\Rightarrow\\text{continuous}`,
});
