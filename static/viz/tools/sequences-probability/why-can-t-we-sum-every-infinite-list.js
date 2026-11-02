import { plotTool } from '../../lib/recipes.js';
import { fixed } from '../../lib/format.js';

const L = { half: ['1 + ½ + ¼ + …', (k) => 0.5 ** k], alt: ['1 − 1 + 1 − 1 + …', (k) => (-1) ** k], harm: ['1 + ½ + ⅓ + …', (k) => 1 / (k + 1)] };
const state = { kind: 'half', n: 20 };
const sums = (s) => { let t = 0; return Array.from({ length: s.n }, (_, k) => (t += L[s.kind][1](k))); };

plotTool({
  state,
  label: 'The partial sums of the chosen infinite list against the number of terms. One levels off, one flips between two values for ever, and one climbs slowly without limit.',
  x: [0, 40],
  y: [0, 5],
  xLabel: 'number of terms',
  yLabel: 'partial sum',
  range: (s) => [[0, s.n + 1], [-0.2, Math.max(...sums(s)) * 1.15 + 0.5]],
  points: (s, c) => sums(s).map((v, i) => [i + 1, v, c.a, 4]),
  controls: [
    { title: 'An infinite list' },
    { key: 'kind', label: 'List', options: Object.entries(L).map(([k, v]) => [k, v[0]]) },
    { key: 'n', label: 'Terms', min: 5, max: 60, step: 5 },
    { readout: [['Last partial sum', (s) => fixed(sums(s)[s.n - 1], 4)], ['Verdict', (s) => ({ half: 'settles at 2', alt: 'never settles', harm: 'grows without limit' }[s.kind])]] },
  ],
  tex: (s) => `S_n=${fixed(sums(s)[s.n - 1], 4)}`,
});
