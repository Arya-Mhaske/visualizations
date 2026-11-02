import { plotTool } from '../../lib/recipes.js';
import { fixed } from '../../lib/format.js';
import { gpTerm, gpSum } from './_seq.js';

const state = { a: 3, r: 0.6, n: 8 };

plotTool({
  state,
  label: 'Dots for the terms of a geometric sequence, which shrink or grow by a constant factor, and dots for the partial sums, which level off to the infinite sum when the ratio is small enough.',
  x: [0, 15],
  y: [-5, 10],
  xLabel: 'n',
  yLabel: 'term or sum',
  range: (s) => { const all = Array.from({ length: s.n }, (_, i) => [gpTerm(s.a, s.r, i + 1), gpSum(s.a, s.r, i + 1)]).flat(); return [[0, s.n + 1], [Math.min(...all, 0) - 1, Math.max(...all, 1) * 1.15 + 1]]; },
  curves: (s, c) => (Math.abs(s.r) < 1 ? [[() => s.a / (1 - s.r), { color: c.c, dash: [6, 5] }]] : []),
  points: (s, c) => Array.from({ length: s.n }, (_, i) => [[i + 1, gpTerm(s.a, s.r, i + 1), c.a, 4], [i + 1, gpSum(s.a, s.r, i + 1), c.b, 4]]).flat(),
  controls: [
    { title: 'The progression' },
    { key: 'a', label: 'First term a', min: 1, max: 6, step: 1 },
    { key: 'r', label: 'Ratio r', min: -1.5, max: 1.5, step: 0.1 },
    { key: 'n', label: 'Terms n', min: 2, max: 15, step: 1 },
    { readout: [['aₙ', (s) => fixed(gpTerm(s.a, s.r, s.n), 4)], ['Sₙ', (s) => fixed(gpSum(s.a, s.r, s.n), 4)], ['S∞', (s) => (Math.abs(s.r) < 1 ? fixed(s.a / (1 - s.r), 4) : 'does not exist')]] },
  ],
  tex: (s) => `S_n=\\dfrac{a(1-r^n)}{1-r}=${fixed(gpSum(s.a, s.r, s.n), 3)}`,
});
