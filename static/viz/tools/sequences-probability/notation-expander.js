import { barTool } from '../../lib/recipes.js';

const F = { k: ['k', (k) => k, 'k'], sq: ['k²', (k) => k * k, 'k^2'], odd: ['2k − 1', (k) => 2 * k - 1, '2k-1'], two: ['2ᵏ', (k) => 2 ** k, '2^k'] };
const state = { f: 'sq', n: 5 };
const terms = (s) => Array.from({ length: s.n }, (_, i) => F[s.f][1](i + 1));

barTool({
  state,
  label: 'Bars for each term of the sum, from k equals one to n, and the total of all the terms.',
  rows: (s, c) => [...terms(s).map((v, i) => [`k = ${i + 1}`, v, c.fillB, String(v)]), ['sum', terms(s).reduce((t, v) => t + v, 0), c.fillC, String(terms(s).reduce((t, v) => t + v, 0))]],
  max: (s) => terms(s).reduce((t, v) => t + v, 0),
  left: 0.2,
  controls: [
    { title: 'Σ from k = 1 to n' },
    { key: 'f', label: 'Rule f(k)', options: Object.entries(F).map(([k, v]) => [k, v[0]]) },
    { key: 'n', label: 'n', min: 1, max: 10, step: 1 },
    { readout: [['Expanded', (s) => terms(s).join(' + ')], ['Total', (s) => String(terms(s).reduce((t, v) => t + v, 0))]] },
  ],
  tex: (s) => `\\sum_{k=1}^{${s.n}}${F[s.f][2]}=${terms(s).join('+')}=${terms(s).reduce((t, v) => t + v, 0)}`,
});
