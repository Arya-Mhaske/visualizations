import { plotTool } from '../../lib/recipes.js';
import { sig } from '../../lib/format.js';

const state = { D: 5000, rate: 12, yrs: 20 };
const fv = (s, months) => { const i = s.rate / 1200; return i === 0 ? s.D * months : (s.D * ((1 + i) ** months - 1)) / i; };

plotTool({
  state,
  label: 'The value of a monthly investment plan over the years compared with the total deposited. The gap between them is the interest, which grows faster and faster.',
  x: [0, 30],
  y: [0, 5e7],
  xLabel: 'years',
  yLabel: 'value (₹ lakh)',
  range: (s) => [[0, s.yrs], [0, fv(s, s.yrs * 12) / 1e5 * 1.1]],
  curves: (s, c) => [[(y) => fv(s, y * 12) / 1e5, { color: c.b }], [(y) => (s.D * y * 12) / 1e5, { color: c.a, dash: [6, 5] }]],
  texts: (s) => [['value', s.yrs * 0.8, fv(s, s.yrs * 0.8 * 12) / 1e5 + 2, {}], ['deposited', s.yrs * 0.8, (s.D * s.yrs * 0.8 * 12) / 1e5 - 3, {}]],
  controls: [
    { title: 'The plan' },
    { key: 'D', label: 'Monthly deposit (₹)', min: 1000, max: 20000, step: 500 },
    { key: 'rate', label: 'Assumed return (% a year)', min: 0, max: 15, step: 0.5 },
    { key: 'yrs', label: 'Years', min: 1, max: 30, step: 1 },
    { readout: [
      ['Deposited', (s) => `₹${sig((s.D * s.yrs * 12) / 1e5, 4)} lakh`],
      ['Value', (s) => `₹${sig(fv(s, s.yrs * 12) / 1e5, 4)} lakh`],
      ['Interest earned', (s) => `₹${sig((fv(s, s.yrs * 12) - s.D * s.yrs * 12) / 1e5, 4)} lakh`],
    ] },
  ],
  tex: (s) => `FV=D\\dfrac{(1+i)^n-1}{i}`,
});
