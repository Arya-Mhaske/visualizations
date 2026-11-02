import { plotTool } from '../../lib/recipes.js';
import { fixed } from '../../lib/format.js';

const state = { T: 288, h: 6 };
const H = (s) => (8.314 * s.T) / (0.029 * 9.8) / 1000;
const P = (s, h) => Math.exp(-h / H(s));

plotTool({
  state,
  label: 'Air pressure as a fraction of sea-level pressure against height. It falls off by a constant factor for each extra step in height, so the curve flattens out.',
  x: [0, 30],
  y: [0, 1],
  xLabel: 'height (km)',
  yLabel: 'P / P₀',
  range: () => [[0, 30], [0, 1.05]],
  curves: (s, c) => [[(h) => P(s, h), { color: c.b }], [() => 0.5, { color: c.grid, dash: [5, 5] }]],
  points: (s, c) => [[s.h, P(s, s.h), c.a], [H(s) * Math.LN2, 0.5, c.c, 5]],
  controls: [
    { title: 'Climb' },
    { key: 'h', label: 'Height (km)', min: 0, max: 30, step: 0.5 },
    { key: 'T', label: 'Temperature (K)', min: 220, max: 320, step: 4 },
    { readout: [
      ['P / P₀', (s) => fixed(P(s, s.h), 3)],
      ['Pressure', (s) => `${fixed(101.3 * P(s, s.h), 1)} kPa`],
      ['Scale height H', (s) => `${fixed(H(s), 2)} km`],
      ['Halves every', (s) => `${fixed(H(s) * Math.LN2, 2)} km`],
    ] },
  ],
  tex: (s) => `P=P_0e^{-h/H},\\quad H=\\dfrac{RT}{Mg}=${fixed(H(s), 2)}\\ \\mathrm{km}`,
});
