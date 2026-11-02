import { barTool } from '../../lib/recipes.js';
import { fixed } from '../../lib/format.js';

const state = { n: 20, m: 10, s: 2, wrong: 8, right: 12 };
const sumX = (s) => s.n * s.m;
const sumX2 = (s) => s.n * (s.s ** 2 + s.m ** 2);
const newM = (s) => (sumX(s) - s.wrong + s.right) / s.n;
const newV = (s) => (sumX2(s) - s.wrong ** 2 + s.right ** 2) / s.n - newM(s) ** 2;

barTool({
  state,
  label: 'Bars for the mean and standard deviation before and after correcting one wrongly recorded value.',
  rows: (s, c) => [['mean before', s.m, c.fillB, fixed(s.m, 3)], ['mean after', newM(s), c.fillA, fixed(newM(s), 3)], ['SD before', s.s, c.fillB, fixed(s.s, 3)], ['SD after', Math.sqrt(Math.max(newV(s), 0)), c.fillA, fixed(Math.sqrt(Math.max(newV(s), 0)), 3)]],
  max: 14,
  left: 0.26,
  controls: [
    { title: 'The record' },
    { key: 'n', label: 'Number of observations', min: 5, max: 50, step: 1 },
    { key: 'm', label: 'Recorded mean', min: 5, max: 20, step: 0.5 },
    { key: 's', label: 'Recorded SD', min: 0.5, max: 5, step: 0.1 },
    { key: 'wrong', label: 'Wrong value', min: 0, max: 20, step: 1 },
    { key: 'right', label: 'Correct value', min: 0, max: 20, step: 1 },
    { readout: [['Corrected Σx', (s) => fixed(sumX(s) - s.wrong + s.right, 2)], ['Corrected Σx²', (s) => fixed(sumX2(s) - s.wrong ** 2 + s.right ** 2, 2)], ['Corrected variance', (s) => fixed(newV(s), 3)]] },
  ],
  tex: (s) => `\\bar x_{new}=${fixed(newM(s), 3)},\\ \\sigma_{new}=${fixed(Math.sqrt(Math.max(newV(s), 0)), 3)}`,
});
