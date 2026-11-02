import { plotTool } from '../../lib/recipes.js';
import { fixed } from '../../lib/format.js';
import { GN, ME, RE, RM, RMOON } from './_rg.js';

const state = { q: 81.3 };
const D = RMOON;
const M2 = (s) => ME / s.q;
const phi = (s, x) => -GN * ME / (x * D) - (GN * M2(s)) / ((1 - x) * D);
const xn = (s) => 1 / (1 + Math.sqrt(M2(s) / ME));
const vmin = (s) => Math.sqrt(2 * (phi(s, xn(s)) - phi(s, RE / D)));

plotTool({
  state,
  label: 'The potential energy per kilogram along the line between the Earth and the Moon. It has a hill between them, whose top is the neutral point where the pulls cancel.',
  x: [0, 1],
  y: [-70, 0],
  xLabel: 'distance from the Earth (fraction of the Earth–Moon distance)',
  yLabel: 'U per kg (MJ/kg)',
  range: () => [[0.02, 0.98], [-6, -0.5]],
  curves: (s, c) => [[(x) => phi(s, x) / 1e6, { color: c.b }]],
  points: (s, c) => [[xn(s), phi(s, xn(s)) / 1e6, c.a, 8]],
  controls: [
    { title: 'Earth and a second body' },
    { key: 'q', label: 'Earth mass ÷ second body\'s mass', min: 1, max: 200, step: 0.5 },
    { readout: [
      ['Neutral point', (s) => `${fixed(xn(s) * 100, 1)}% of the way`],
      ['Least speed from the Earth\'s surface', (s) => `${fixed(vmin(s) / 1000, 2)} km/s`],
      ['Earth escape speed', () => '11.18 km/s'],
    ] },
  ],
  tex: (s) => `\\dfrac{GM_1}{x^2}=\\dfrac{GM_2}{(d-x)^2}\\ \\Rightarrow\\ x=${fixed(xn(s), 3)}\\,d`,
});
