import { plotTool } from '../../lib/recipes.js';
import { fixed } from '../../lib/format.js';

const state = { r: 1.5 };
const g = (r) => (r < 1 ? 0 : 1 / (r * r));

plotTool({
  state,
  label: 'The pull of a hollow shell of radius one against distance from its centre. It is zero inside and equal to that of a point mass at the centre outside.',
  x: [0, 3],
  y: [0, 1.2],
  xLabel: 'r / R',
  yLabel: 'pull (units of GM/R²)',
  range: () => [[0, 3], [0, 1.2]],
  curves: (s, c) => [[g, { color: c.b }], [(r) => 1 / (r * r), { color: c.grid, dash: [5, 5], domain: [0.5, 3] }]],
  points: (s, c) => [[s.r, g(s.r), c.a]],
  controls: [
    { title: 'A test mass' },
    { key: 'r', label: 'Distance r / R', min: 0.1, max: 3, step: 0.05 },
    { readout: [
      ['Pull of the shell', (s) => `${fixed(g(s.r), 3)} GM/R²`],
      ['Point mass at the centre', (s) => `${fixed(1 / (s.r * s.r), 3)}`],
      ['Where', (s) => (s.r < 1 ? 'inside: 0' : 'outside: same as a point')],
    ] },
  ],
  tex: (s) => (s.r < 1 ? 'g=0\\ (\\text{inside the shell})' : `g=\\dfrac{GM}{r^2}=${fixed(1 / (s.r * s.r), 3)}\\ \\dfrac{GM}{R^2}`),
});
