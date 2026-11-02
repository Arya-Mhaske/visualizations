import { plotTool } from '../../lib/recipes.js';
import { fixed } from '../../lib/format.js';
import { lostFraction } from './_collisions.js';

const state = { A: 12 };
const left = (A, n) => (1 - lostFraction(A)) ** n;

plotTool({
  state,
  label: 'Neutron kinetic energy left, on a log scale, against the number of head-on hits for hydrogen, deuterium, carbon and the chosen nucleus. Light nuclei slow the neutron in far fewer hits.',
  x: [0, 20],
  y: [-6, 0],
  xLabel: 'number of hits',
  yLabel: 'log₁₀ (KE left)',
  range: () => [[0, 20], [-6, 0.3]],
  curves: (s, c) => [[(n) => Math.max(-6, Math.log10(Math.max(left(2, n), 1e-9))), { color: c.b }], [(n) => Math.log10(left(12, n)), { color: c.c }], [(n) => Math.log10(left(s.A, n)), { color: c.a, dash: [6, 5] }]],
  texts: () => [['D (A=2)', 2.3, -5.5, { align: 'left' }], ['C (A=12)', 12, -1.3, { align: 'left' }]],
  controls: [
    { title: 'Moderator nucleus' },
    { key: 'A', label: 'Mass number A', min: 1, max: 200, step: 1 },
    { readout: [
      ['KE lost per hit 4A/(1+A)²', (s) => `${fixed(lostFraction(s.A) * 100, 1)}%`],
      ['Deuterium', () => `${fixed(lostFraction(2) * 100, 1)}% (8/9)`],
      ['Carbon', () => `${fixed(lostFraction(12) * 100, 1)}%`],
      ['Hits to reach 1% of the energy', (s) => (lostFraction(s.A) >= 1 ? '1' : String(Math.ceil(Math.log(0.01) / Math.log(1 - lostFraction(s.A)))))],
    ] },
  ],
  tex: (s) => `\\dfrac{\\Delta K}{K}=\\dfrac{4A}{(1+A)^2}=${fixed(lostFraction(s.A), 3)}`,
});
