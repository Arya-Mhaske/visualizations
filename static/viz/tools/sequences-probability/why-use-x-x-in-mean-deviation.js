import { plotTool } from '../../lib/recipes.js';
import { fixed } from '../../lib/format.js';
import { mean } from './_seq.js';

const state = { k: 3, v: 4 };
const data = (s) => { const d = [2, 4, 4, 4, 5, 5, 7, 9]; d[s.k] = s.v; return d; };

plotTool({
  state,
  label: 'A dot plot with a line at the mean and a segment from the mean to every point. Segments to the right and left cancel when added with their signs.',
  x: [0, 10],
  y: [-1, 9],
  range: () => [[0, 11], [-1, 9.5]],
  segments: (s, c) => data(s).map((x, i) => [mean(data(s)), i + 0.5, x, i + 0.5, { color: x >= mean(data(s)) ? c.c : c.a, width: 4 }]),
  points: (s, c) => data(s).map((x, i) => [x, i + 0.5, c.ink, 5]),
  draw: (ctx, stage, c, plot) => plot.segment(mean(data(state)), -0.5, mean(data(state)), 8.6, { color: c.b, width: 2, dash: [5, 4] }),
  controls: [
    { title: 'Eight values' },
    { key: 'k', label: 'Move point number', min: 0, max: 7, step: 1 },
    { key: 'v', label: 'New value', min: 0, max: 10, step: 0.5 },
    { readout: [
      ['Mean', (s) => fixed(mean(data(s)), 3)],
      ['Σ(x − x̄)', (s) => fixed(data(s).reduce((t, x) => t + (x - mean(data(s))), 0), 6)],
      ['Σ|x − x̄|', (s) => fixed(data(s).reduce((t, x) => t + Math.abs(x - mean(data(s))), 0), 3)],
    ] },
  ],
  tex: () => `\\sum(x_i-\\bar x)=0`,
});
