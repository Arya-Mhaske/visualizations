import { plotTool } from '../../lib/recipes.js';
import { sig } from '../../lib/format.js';

const state = { tau: 10 };
const solid = (s) => s.tau / 8.4e10;
const liquid = (s, t) => (s.tau * t) / 1e-3;

plotTool({
  state,
  label: 'The shear strain against time for a solid block and for water under the same shear stress, on a log scale. The solid settles at a tiny value and stays; the water keeps growing.',
  x: [0, 10],
  y: [-12, 6],
  xLabel: 't (s)',
  yLabel: 'log₁₀ (shear strain)',
  range: () => [[0, 10], [-12, 7]],
  curves: (s, c) => [[() => Math.log10(solid(s)), { color: c.b }], [(t) => Math.log10(Math.max(liquid(s, t), 1e-12)), { color: c.a }]],
  texts: (s) => [['solid: fixed strain', 5, Math.log10(solid(s)) + 0.8, {}], ['water: grows without limit', 4, Math.log10(liquid(s, 4)) - 1.2, {}]],
  controls: [
    { title: 'A sideways push' },
    { key: 'tau', label: 'Shear stress (Pa)', min: 1, max: 100, step: 1 },
    { readout: [
      ['Solid strain (steel)', (s) => sig(solid(s), 3)],
      ['Water strain after 1 s', (s) => sig(liquid(s, 1), 3)],
      ['Shear modulus of water', () => '0'],
    ] },
  ],
  tex: () => `G_{\\text{solid}}=\\dfrac{\\tau}{\\gamma}\\quad G_{\\text{liquid}}=0`,
});
