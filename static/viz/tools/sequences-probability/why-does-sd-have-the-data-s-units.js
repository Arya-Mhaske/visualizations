import { plotTool } from '../../lib/recipes.js';
import { sig } from '../../lib/format.js';
import { mean, sd, variance } from './_seq.js';

const U = { cm: ['cm', 1], m: ['m', 0.01], mm: ['mm', 10] };
const state = { u: 'cm' };
const data = (s) => [150, 155, 160, 160, 165, 170, 175].map((x) => x * U[s.u][1]);

plotTool({
  state,
  label: 'A line of heights in the chosen unit with the mean marked and a bar from mean minus SD to mean plus SD, which is in the same unit as the heights.',
  x: [140, 180],
  y: [-1, 2],
  xLabel: 'height',
  range: (s) => [[135 * U[s.u][1], 180 * U[s.u][1]], [-1, 2]],
  segments: (s, c) => [[mean(data(s)) - sd(data(s)), 0.5, mean(data(s)) + sd(data(s)), 0.5, { color: c.a, width: 8 }]],
  points: (s, c) => [...data(s).map((x) => [x, 1, c.b, 6]), [mean(data(s)), 0.5, c.ink, 7]],
  controls: [
    { title: 'Units' },
    { key: 'u', label: 'Measure in', options: Object.entries(U).map(([k, v]) => [k, v[0]]) },
    { readout: [
      ['Mean', (s) => `${sig(mean(data(s)), 4)} ${U[s.u][0]}`],
      ['Variance', (s) => `${sig(variance(data(s)), 4)} ${U[s.u][0]}²`],
      ['SD = √variance', (s) => `${sig(sd(data(s)), 4)} ${U[s.u][0]}`],
    ] },
  ],
  tex: (s) => `\\sigma=\\sqrt{${sig(variance(data(s)), 4)}\\ \\mathrm{${U[s.u][0]}^2}}=${sig(sd(data(s)), 4)}\\ \\mathrm{${U[s.u][0]}}`,
});
