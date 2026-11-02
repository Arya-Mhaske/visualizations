import { plotTool } from '../../lib/recipes.js';
import { fixed } from '../../lib/format.js';
import { GM, RE, vCirc } from './_rg.js';

const state = { lost: 3 };
const r0 = RE + 600e3;
const r1 = (s) => 1 / (1 / r0 + (2 * s.lost * 1e6) / GM);

plotTool({
  state,
  label: 'Orbital speed against orbit radius, falling with radius, with two markers: the starting orbit and the lower, faster orbit after drag has removed some energy.',
  x: [6.4, 7.2],
  y: [7, 8],
  xLabel: 'orbit radius (thousand km)',
  yLabel: 'v (km/s)',
  range: () => [[6.3, 7.1], [7.4, 8]],
  curves: (s, c) => [[(x) => vCirc(x * 1e6) / 1000, { color: c.b }]],
  points: (s, c) => [[r0 / 1e6, vCirc(r0) / 1000, c.fillB, 7], [r1(s) / 1e6, vCirc(r1(s)) / 1000, c.a, 8]],
  controls: [
    { title: 'Drag removes energy' },
    { key: 'lost', label: 'Energy removed per kg (MJ/kg)', min: 0, max: 8, step: 0.5 },
    { readout: [
      ['Radius before | after', (s) => `${fixed(r0 / 1000, 0)} | ${fixed(r1(s) / 1000, 0)} km`],
      ['Speed before | after', (s) => `${fixed(vCirc(r0) / 1000, 3)} | ${fixed(vCirc(r1(s)) / 1000, 3)} km/s`],
    ] },
  ],
  tex: (s) => `E=-\\dfrac{GMm}{2r}:\\ \\text{less }E\\Rightarrow\\text{smaller }r\\Rightarrow\\text{larger }v`,
});
