import { plotTool } from '../../lib/recipes.js';
import { sig } from '../../lib/format.js';
import { GM, RE } from './_rg.js';

const state = { r: 3 };
const U = (x) => -(GM / (x * RE)) / 1e6; // MJ per kg

plotTool({
  state,
  label: 'Gravitational potential energy per kilogram against distance from the centre of the Earth. It is negative and rises towards zero at infinity.',
  x: [1, 10],
  y: [-65, 0],
  xLabel: 'r / R',
  yLabel: 'U per kg (MJ/kg)',
  range: () => [[0.9, 10], [-68, 4]],
  curves: (s, c) => [[U, { color: c.b }], [() => 0, { color: c.ink, dash: [5, 5] }]],
  points: (s, c) => [[s.r, U(s.r), c.a]],
  controls: [
    { title: 'Bring a mass in' },
    { key: 'r', label: 'Distance r / R', min: 1, max: 10, step: 0.1 },
    { readout: [
      ['U per kg', (s) => `${sig(U(s.r), 3)} MJ`],
      ['Work to escape, per kg', (s) => `${sig(-U(s.r), 3)} MJ`],
    ] },
  ],
  tex: (s) => `U=-\\dfrac{GMm}{r}\\quad(U\\to0\\ \\text{as}\\ r\\to\\infty)`,
});
