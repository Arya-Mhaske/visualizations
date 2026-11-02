import { plotTool } from '../../lib/recipes.js';
import { fixed } from '../../lib/format.js';
import { fibs } from './_seq.js';

const state = { n: 12, a: 1, b: 1 };
const PHI = (1 + Math.sqrt(5)) / 2;
const ratios = (s) => { const f = fibs(s.n + 1, s.a, s.b); return f.slice(1).map((v, i) => v / f[i]); };

plotTool({
  state,
  label: 'The ratio of each Fibonacci number to the one before it, plotted against the term number. The dots swing above and below the golden ratio and settle onto it.',
  x: [1, 20],
  y: [0.5, 2.5],
  xLabel: 'n',
  yLabel: 'F(n+1) / F(n)',
  range: (s) => [[1, s.n + 1], [0.4, 3]],
  curves: (s, c) => [[() => PHI, { color: c.c, dash: [6, 5] }]],
  points: (s, c) => ratios(s).map((r, i) => [i + 1, r, c.a, 5]),
  controls: [
    { title: 'Ratios' },
    { key: 'n', label: 'Terms', min: 3, max: 20, step: 1 },
    { key: 'a', label: 'First term', min: 1, max: 5, step: 1 },
    { key: 'b', label: 'Second term', min: 1, max: 5, step: 1 },
    { readout: [['Last ratio', (s) => fixed(ratios(s)[s.n - 1], 6)], ['φ = (1+√5)/2', () => fixed(PHI, 6)], ['φ² − φ', () => fixed(PHI * PHI - PHI, 6)]] },
  ],
  tex: () => `\\varphi=1+\\dfrac1\\varphi\\ \\Rightarrow\\ \\varphi=\\dfrac{1+\\sqrt5}{2}`,
});
