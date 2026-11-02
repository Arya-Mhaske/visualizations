import { plotTool } from '../../lib/recipes.js';
import { fixed } from '../../lib/format.js';
import { gpSum } from './_seq.js';

const state = { r: 0.5 };
const N = 20;
const vals = (s) => Array.from({ length: N }, (_, i) => gpSum(1, s.r, i + 1));

plotTool({
  state,
  label: 'The partial sums of a geometric series with first term one, against the number of terms. They level off for a ratio between minus one and one, and otherwise grow or swing.',
  x: [0, N],
  y: [-5, 10],
  xLabel: 'n',
  yLabel: 'Sₙ',
  range: (s) => { const v = vals(s); const lim = Math.min(Math.max(...v.map(Math.abs)) * 1.1 + 0.5, 30); return [[0, N + 1], [-lim, lim]]; },
  curves: (s, c) => (Math.abs(s.r) < 1 ? [[() => 1 / (1 - s.r), { color: c.c, dash: [6, 5] }]] : []),
  points: (s, c) => vals(s).map((v, i) => [i + 1, v, c.a, 4]),
  controls: [
    { title: 'The ratio' },
    { key: 'r', label: 'Ratio r', min: -1.5, max: 1.5, step: 0.05 },
    { readout: [
      ['S₂₀', (s) => fixed(gpSum(1, s.r, N), 4)],
      ['Limit 1/(1 − r)', (s) => (Math.abs(s.r) < 1 ? fixed(1 / (1 - s.r), 4) : 'none')],
      ['Behaviour', (s) => (Math.abs(s.r) < 1 ? 'settles' : s.r === -1 ? 'flips between 1 and 0' : 'does not settle')],
    ] },
  ],
  tex: (s) => `S_n=\\dfrac{1-r^n}{1-r}\\quad r=${fixed(s.r, 2)}`,
});
