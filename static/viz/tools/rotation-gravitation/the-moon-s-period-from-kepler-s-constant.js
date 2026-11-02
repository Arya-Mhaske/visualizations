import { plotTool } from '../../lib/recipes.js';
import { sci, fixed } from '../../lib/format.js';
import { GM } from './_rg.js';

const state = { r: 384400 };
const k = (4 * Math.PI ** 2) / GM;
const T = (rkm) => Math.sqrt(k * (rkm * 1000) ** 3) / 86400;

plotTool({
  state,
  label: 'Orbital period in days against distance from the Earth in thousands of kilometres, with a marker at the chosen distance.',
  x: [0, 450],
  y: [0, 32],
  xLabel: 'r (thousand km)',
  yLabel: 'T (days)',
  range: () => [[0, 450], [0, 34]],
  curves: (s, c) => [[(r) => T(r * 1000), { color: c.b }]],
  points: (s, c) => [[s.r / 1000, T(s.r), c.a]],
  controls: [
    { title: 'Orbit distance' },
    { key: 'r', label: 'Distance from the Earth (km)', min: 50000, max: 450000, step: 1000 },
    { readout: [
      ['Kepler constant k', () => `${sci(k, 3)} s²/m³`],
      ['Period', (s) => `${fixed(T(s.r), 2)} days`],
    ] },
  ],
  tex: (s) => `T=\\sqrt{kr^3}=${fixed(T(s.r), 2)}\\ \\text{days}`,
});
