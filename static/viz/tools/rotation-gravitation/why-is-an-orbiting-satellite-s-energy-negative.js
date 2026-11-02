import { plotTool } from '../../lib/recipes.js';
import { fixed } from '../../lib/format.js';
import { GM, RE } from './_rg.js';

const state = { r: 2 };
const K = (x) => GM / (2 * x * RE) / 1e6;

plotTool({
  state,
  label: 'Kinetic, potential and total energy per kilogram of a satellite against orbit radius. The kinetic energy is positive, the potential energy is negative and twice as large, and the total is negative and equal to minus the kinetic energy.',
  x: [1, 8],
  y: [-65, 35],
  xLabel: 'orbit radius r / R',
  yLabel: 'energy per kg (MJ/kg)',
  range: () => [[1, 8], [-70, 40]],
  curves: (s, c) => [[K, { color: c.a }], [(x) => -2 * K(x), { color: c.b }], [(x) => -K(x), { color: c.c }], [() => 0, { color: c.ink, dash: [5, 5] }]],
  points: (s, c) => [[s.r, K(s.r), c.a], [s.r, -2 * K(s.r), c.b], [s.r, -K(s.r), c.c]],
  controls: [
    { title: 'Orbit radius' },
    { key: 'r', label: 'r / R', min: 1, max: 8, step: 0.1 },
    { readout: [
      ['K = GMm/2r', (s) => `${fixed(K(s.r), 2)} MJ/kg`],
      ['U = −GMm/r', (s) => `${fixed(-2 * K(s.r), 2)} MJ/kg`],
      ['E = K + U', (s) => `${fixed(-K(s.r), 2)} MJ/kg`],
    ] },
  ],
  tex: () => `K=-\\tfrac12U,\\quad E=K+U=-K=-\\dfrac{GMm}{2r}`,
});
