import { barTool } from '../../lib/recipes.js';
import { fixed } from '../../lib/format.js';
import { mean, variance } from './_seq.js';

const SETS = { a: [2, 4, 4, 4, 5, 5, 7, 9], b: [3, 5, 8, 13, 21], c: [10, 12, 23, 23, 16, 23, 21, 16] };
const state = { s: 'a', shift: 0 };
const data = (s) => SETS[s.s].map((x) => x + s.shift);
const short = (s) => data(s).reduce((t, x) => t + x * x, 0) / data(s).length - mean(data(s)) ** 2;

barTool({
  state,
  label: 'Two bars for the variance computed by the definition and by the shortcut, which are equal.',
  rows: (s, c) => [['Σ(x − x̄)²/n', variance(data(s)), c.fillB, fixed(variance(data(s)), 4)], ['Σx²/n − x̄²', short(s), c.fillA, fixed(short(s), 4)]],
  max: (s) => Math.max(variance(data(s)), 1),
  left: 0.3,
  controls: [
    { title: 'A data set' },
    { key: 's', label: 'Data', options: [['a', 'Set A'], ['b', 'Set B'], ['c', 'Set C']] },
    { key: 'shift', label: 'Add a constant to every value', min: 0, max: 100, step: 10 },
    { readout: [['Σx / n = x̄', (s) => fixed(mean(data(s)), 3)], ['Σx² / n', (s) => fixed(data(s).reduce((t, x) => t + x * x, 0) / data(s).length, 3)], ['Variance', (s) => fixed(variance(data(s)), 4)]] },
  ],
  tex: (s) => `\\sigma^2=\\dfrac{\\sum x^2}{n}-\\bar x^2=${fixed(short(s), 4)}`,
});
