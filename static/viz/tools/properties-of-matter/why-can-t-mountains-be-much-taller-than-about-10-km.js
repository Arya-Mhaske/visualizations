import { plotTool } from '../../lib/recipes.js';
import { fixed } from '../../lib/format.js';

const state = { sy: 3e8, rho: 3000, g: 9.8 };
const hmax = (s) => s.sy / (s.rho * s.g) / 1000;

plotTool({
  state,
  label: 'The pressure at the base of a mountain against its height, a straight line, with a horizontal line for the strength of the rock. They cross at the greatest possible height.',
  x: [0, 20],
  y: [0, 6e8],
  xLabel: 'height (km)',
  yLabel: 'pressure at the base (Pa)',
  range: (s) => [[0, Math.max(hmax(s) * 1.6, 5)], [0, s.sy * 1.5]],
  curves: (s, c) => [[(h) => s.rho * s.g * h * 1000, { color: c.b }], [() => s.sy, { color: c.a }]],
  points: (s, c) => [[hmax(s), s.sy, c.c, 8]],
  controls: [
    { title: 'The mountain' },
    { key: 'sy', label: 'Rock strength (Pa)', min: 1e8, max: 6e8, step: 1e7, format: (v) => `${v / 1e8} × 10⁸` },
    { key: 'rho', label: 'Rock density (kg/m³)', min: 2000, max: 4000, step: 100 },
    { key: 'g', label: 'g (m/s²)', min: 2, max: 25, step: 0.2 },
    { readout: [['Greatest height', (s) => `${fixed(hmax(s), 1)} km`]] },
  ],
  tex: (s) => `h_{\\max}=\\dfrac{\\sigma}{\\rho g}=${fixed(hmax(s), 1)}\\ \\mathrm{km}`,
});
