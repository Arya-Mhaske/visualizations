import { plotTool } from '../../lib/recipes.js';
import { fixed } from '../../lib/format.js';
import { apTerm } from './_seq.js';

const state = { a: 3, d: 2, n: 8 };

plotTool({
  state,
  label: 'The terms of an arithmetic progression plotted against n. The points fall on a straight line with slope d, drawn dashed and extended back to meet the vertical axis.',
  x: [0, 12],
  y: [-10, 40],
  xLabel: 'n',
  yLabel: 'aₙ',
  range: (s) => [[0, s.n + 1], [Math.min(apTerm(s.a, s.d, 0), apTerm(s.a, s.d, s.n), 0) - 2, Math.max(apTerm(s.a, s.d, 0), apTerm(s.a, s.d, s.n)) + 3]],
  curves: (s, c) => [[(n) => apTerm(s.a, s.d, n), { color: c.b, dash: [6, 5] }]],
  points: (s, c) => Array.from({ length: s.n }, (_, i) => [i + 1, apTerm(s.a, s.d, i + 1), c.a, 5]),
  controls: [
    { title: 'An arithmetic progression' },
    { key: 'a', label: 'First term a₁', min: -5, max: 10, step: 1 },
    { key: 'd', label: 'Common difference d', min: -4, max: 5, step: 1 },
    { key: 'n', label: 'Terms shown', min: 3, max: 12, step: 1 },
    { readout: [['Slope', (s) => String(s.d)], ['Intercept a₁ − d', (s) => String(s.a - s.d)], [`Last term`, (s) => String(apTerm(s.a, s.d, s.n))]] },
  ],
  tex: (s) => `a_n=${s.d}n+${s.a - s.d}`,
});
