import { barTool } from '../../lib/recipes.js';
import { apTerm, apSum } from './_seq.js';

const state = { kind: 'seats', a: 20, d: 2, n: 10 };
const unit = (s) => (s.kind === 'seats' ? '' : '₹');

barTool({
  state,
  label: 'Bars for the number of seats in each row, or the amount saved each week, increasing in equal steps, with a bar for the running total.',
  rows: (s, c) => [...Array.from({ length: Math.min(s.n, 12) }, (_, i) => [`${s.kind === 'seats' ? 'row' : 'week'} ${i + 1}`, apTerm(s.a, s.d, i + 1), c.fillB, `${unit(s)}${apTerm(s.a, s.d, i + 1)}`])],
  max: (s) => apTerm(s.a, s.d, Math.min(s.n, 12)) * 1.05 + 1,
  left: 0.2,
  controls: [
    { title: 'Rows or weeks' },
    { key: 'kind', label: 'Scenario', options: [['seats', 'Theatre seats'], ['save', 'Weekly savings']] },
    { key: 'a', label: 'First amount', min: 10, max: 100, step: 5 },
    { key: 'd', label: 'Increase each time', min: 0, max: 10, step: 1 },
    { key: 'n', label: 'Number of rows or weeks', min: 2, max: 12, step: 1 },
    { readout: [['Last amount', (s) => `${unit(s)}${apTerm(s.a, s.d, s.n)}`], ['Total', (s) => `${unit(s)}${apSum(s.a, s.d, s.n)}`]] },
  ],
  tex: (s) => `S_n=\\dfrac n2[2a+(n-1)d]=${apSum(s.a, s.d, s.n)}`,
});
