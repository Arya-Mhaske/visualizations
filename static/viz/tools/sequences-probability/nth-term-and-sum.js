import { barTool } from '../../lib/recipes.js';
import { apTerm, apSum } from './_seq.js';

const state = { a: 3, d: 2, n: 8 };

barTool({
  state,
  label: 'Bars for each term of an arithmetic progression, growing in equal steps, and a bar for the total.',
  rows: (s, c) => [...Array.from({ length: s.n }, (_, i) => [`a${i + 1}`, Math.abs(apTerm(s.a, s.d, i + 1)), apTerm(s.a, s.d, i + 1) < 0 ? c.fillA : c.fillB, String(apTerm(s.a, s.d, i + 1))]), ['Sₙ', Math.abs(apSum(s.a, s.d, s.n)), c.fillC, String(apSum(s.a, s.d, s.n))]],
  max: (s) => Math.max(Math.abs(apSum(s.a, s.d, s.n)), 1),
  left: 0.16,
  controls: [
    { title: 'The progression' },
    { key: 'a', label: 'First term a', min: -5, max: 10, step: 1 },
    { key: 'd', label: 'Difference d', min: -3, max: 6, step: 1 },
    { key: 'n', label: 'Terms n', min: 2, max: 10, step: 1 },
    { readout: [['aₙ', (s) => String(apTerm(s.a, s.d, s.n))], ['Sₙ', (s) => String(apSum(s.a, s.d, s.n))], ['n(a + aₙ)/2', (s) => String((s.n * (s.a + apTerm(s.a, s.d, s.n))) / 2)]] },
  ],
  tex: (s) => `S_n=\\dfrac n2\\left[2a+(n-1)d\\right]=${apSum(s.a, s.d, s.n)}`,
});
