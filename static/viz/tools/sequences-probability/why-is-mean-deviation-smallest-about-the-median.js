import { plotTool } from '../../lib/recipes.js';
import { fixed } from '../../lib/format.js';
import { mean, median, meanDev } from './_seq.js';

const state = { c: 2 };
const D = [1, 2, 2, 3, 4, 6, 12];
const msd = (c) => D.reduce((t, x) => t + (x - c) ** 2, 0) / D.length;

plotTool({
  state,
  label: 'The mean deviation about a centre point c, against c, with its lowest point at the median, and the mean squared deviation, whose lowest point is at the mean. The data are skewed so the two minima are in different places.',
  x: [0, 12],
  y: [0, 30],
  xLabel: 'centre c',
  yLabel: 'MD (blue) and MSD ÷ 5 (coral)',
  range: () => [[0, 12], [0, 12]],
  curves: (s, c) => [[(x) => meanDev(D, x), { color: c.b }], [(x) => msd(x) / 5, { color: c.a, dash: [6, 5] }]],
  points: (s, c) => [[s.c, meanDev(D, s.c), c.b, 7], [median(D), meanDev(D, median(D)), c.c, 5], [mean(D), msd(mean(D)) / 5, c.a, 5]],
  controls: [
    { title: 'Slide the centre' },
    { key: 'c', label: 'Centre c', min: 0, max: 12, step: 0.1 },
    { readout: [
      ['Mean deviation about c', (s) => fixed(meanDev(D, s.c), 3)],
      ['Median | mean of the data', () => `${fixed(median(D), 2)} | ${fixed(mean(D), 2)}`],
      ['Smallest MD', () => fixed(meanDev(D, median(D)), 3)],
    ] },
  ],
  tex: (s) => `\\text{MD}(c)=\\dfrac1n\\sum|x_i-c|=${fixed(meanDev(D, s.c), 3)}`,
});
