import { barTool } from '../../lib/recipes.js';
import { fixed } from '../../lib/format.js';

const state = { m1: 4, m2: 1, Q: 50 };
const K1 = (s) => (s.Q * s.m2) / (s.m1 + s.m2);
const K2 = (s) => (s.Q * s.m1) / (s.m1 + s.m2);
const v = (K, m) => Math.sqrt((2 * K) / m);

barTool({
  state,
  label: 'Bars for the momentum, the speed and the kinetic energy of two decay products. The momenta are equal; the lighter product is faster and carries more of the energy.',
  rows: (s, c) => [
    ['p₁', Math.sqrt(2 * s.m1 * K1(s)), c.fillA, fixed(Math.sqrt(2 * s.m1 * K1(s)), 2)],
    ['p₂', Math.sqrt(2 * s.m2 * K2(s)), c.fillB, fixed(Math.sqrt(2 * s.m2 * K2(s)), 2)],
    ['v₁', v(K1(s), s.m1), c.fillA, fixed(v(K1(s), s.m1), 2)],
    ['v₂', v(K2(s), s.m2), c.fillB, fixed(v(K2(s), s.m2), 2)],
    ['KE₁', K1(s), c.fillA, `${fixed(K1(s), 1)}`],
    ['KE₂', K2(s), c.fillB, `${fixed(K2(s), 1)}`],
  ],
  max: 40,
  controls: [
    { title: 'A nucleus decays' },
    { key: 'm1', label: 'Mass 1', min: 1, max: 20, step: 1 },
    { key: 'm2', label: 'Mass 2', min: 1, max: 20, step: 1 },
    { key: 'Q', label: 'Energy released', min: 10, max: 100, step: 5 },
    { readout: [
      ['Total momentum', () => '0'],
      ['KE share of product 1', (s) => `${fixed((K1(s) / s.Q) * 100, 1)}%`],
    ] },
  ],
  tex: (s) => `\\dfrac{K_1}{K}=\\dfrac{m_2}{m_1+m_2}=${fixed(K1(s) / s.Q, 3)}`,
});
