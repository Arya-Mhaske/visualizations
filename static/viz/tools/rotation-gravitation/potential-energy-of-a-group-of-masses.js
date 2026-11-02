import { barTool } from '../../lib/recipes.js';
import { fixed } from '../../lib/format.js';

const SHAPES = { two: ['Two masses', [[0, 0], [1, 0]]], tri: ['Triangle', [[0, 0], [1, 0], [0.5, Math.sqrt(3) / 2]]], sq: ['Square', [[0, 0], [1, 0], [1, 1], [0, 1]]] };
const state = { s: 'sq', l: 1 };
const pairs = (s) => {
  const P = SHAPES[s.s][1];
  const out = [];
  for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) out.push([`${i + 1}–${j + 1}`, -1 / (Math.hypot(P[i][0] - P[j][0], P[i][1] - P[j][1]) * s.l)]);
  return out;
};
const total = (s) => pairs(s).reduce((t, p) => t + p[1], 0);

barTool({
  state,
  label: 'A bar for the potential energy of every pair of masses in the group, in units of G m squared over l. Their sum is the energy of the group.',
  rows: (s, c) => pairs(s).map(([n, v]) => [`pair ${n}`, Math.abs(v), c.fillB, fixed(v, 3)]),
  max: (s) => 1 / s.l,
  controls: [
    { title: 'A group of equal masses m' },
    { key: 's', label: 'Arrangement', options: Object.entries(SHAPES).map(([k, v]) => [k, v[0]]) },
    { key: 'l', label: 'Side l', min: 0.5, max: 3, step: 0.5 },
    { readout: [['Total U', (s) => `${fixed(total(s), 3)} G m² (per unit l⁻¹)`], ['Pairs', (s) => String(pairs(s).length)]] },
  ],
  tex: (s) => `U=-\\sum_{\\text{pairs}}\\dfrac{Gm^2}{r_{ij}}=${fixed(total(s), 3)}\\ \\dfrac{Gm^2}{l}`,
});
