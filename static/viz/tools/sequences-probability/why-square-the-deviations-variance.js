import { plotTool } from '../../lib/recipes.js';
import { fixed } from '../../lib/format.js';
import { mean, variance, meanDev } from './_seq.js';

const state = { v: 9 };
const data = (s) => [2, 4, 4, 4, 5, 5, 7, s.v];

plotTool({
  state,
  label: 'The absolute deviation and the squared deviation plotted against the deviation. The squared curve is a parabola that rises far above the straight V for large deviations. The data points are marked on both curves.',
  x: [-6, 6],
  y: [0, 36],
  xLabel: 'deviation d',
  yLabel: '|d| and d²',
  range: () => [[-6, 6], [0, 36]],
  curves: (s, c) => [[Math.abs, { color: c.b }], [(d) => d * d, { color: c.a }]],
  points: (s, c) => data(s).flatMap((x) => { const d = x - mean(data(s)); return [[d, Math.abs(d), c.b, 4], [d, d * d, c.a, 4]]; }),
  controls: [
    { title: 'Eight values' },
    { key: 'v', label: 'Value of the last point', min: 0, max: 14, step: 0.5 },
    { readout: [
      ['Mean deviation', (s) => fixed(meanDev(data(s), mean(data(s))), 3)],
      ['Variance σ²', (s) => fixed(variance(data(s)), 3)],
      ['Largest d²', (s) => fixed(Math.max(...data(s).map((x) => (x - mean(data(s))) ** 2)), 2)],
    ] },
  ],
  tex: (s) => `\\sigma^2=\\dfrac1n\\sum(x_i-\\bar x)^2=${fixed(variance(data(s)), 3)}`,
});
