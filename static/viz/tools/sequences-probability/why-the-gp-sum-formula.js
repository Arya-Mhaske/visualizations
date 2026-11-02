import { plotTool } from '../../lib/recipes.js';
import { fixed } from '../../lib/format.js';
import { gpSum } from './_seq.js';

const state = { a: 2, r: 1.5, n: 6 };

plotTool({
  state,
  label: 'The partial sums of a geometric series against the number of terms, as dots, with the closed formula drawn as a curve through them.',
  x: [0, 12],
  y: [0, 60],
  xLabel: 'n',
  yLabel: 'Sₙ',
  range: (s) => [[0, s.n + 1], [Math.min(0, gpSum(s.a, s.r, s.n)) - 1, Math.max(gpSum(s.a, s.r, s.n), s.a) * 1.15 + 1]],
  curves: (s, c) => [[(k) => (s.r === 1 ? s.a * k : (s.a * (1 - s.r ** k)) / (1 - s.r)), { color: c.b, domain: [0, s.n] }]],
  points: (s, c) => Array.from({ length: s.n }, (_, i) => [i + 1, gpSum(s.a, s.r, i + 1), c.a, 5]),
  controls: [
    { title: 'Multiply by r and subtract' },
    { key: 'a', label: 'First term a', min: 1, max: 5, step: 1 },
    { key: 'r', label: 'Ratio r', min: 0.5, max: 2, step: 0.1 },
    { key: 'n', label: 'Terms n', min: 2, max: 12, step: 1 },
    { readout: [
      ['S', (s) => fixed(gpSum(s.a, s.r, s.n), 3)],
      ['rS', (s) => fixed(s.r * gpSum(s.a, s.r, s.n), 3)],
      ['S − rS', (s) => fixed(gpSum(s.a, s.r, s.n) * (1 - s.r), 3)],
      ['a(1 − rⁿ)', (s) => fixed(s.a * (1 - s.r ** s.n), 3)],
    ] },
  ],
  tex: (s) => `S_n=\\dfrac{a(1-r^n)}{1-r}=${fixed(gpSum(s.a, s.r, s.n), 3)}`,
});
