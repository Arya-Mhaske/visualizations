import { plotTool } from '../../lib/recipes.js';
import { fixed } from '../../lib/format.js';

const state = { r: 0.5 };
const g = (r) => (r <= 1 ? r : 1 / (r * r));

plotTool({
  state,
  label: 'Gravitational field strength against distance from the centre of a uniform Earth. It rises in a straight line to the surface and then falls as the inverse square.',
  x: [0, 4],
  y: [0, 1.1],
  xLabel: 'r / R',
  yLabel: 'g / g₀',
  range: () => [[0, 4], [0, 1.1]],
  curves: (s, c) => [[g, { color: c.b }]],
  points: (s, c) => [[s.r, g(s.r), c.a]],
  controls: [
    { title: 'A test mass' },
    { key: 'r', label: 'Distance r / R', min: 0, max: 4, step: 0.05 },
    { readout: [
      ['g / g₀', (s) => fixed(g(s.r), 3)],
      ['g', (s) => `${fixed(9.8 * g(s.r), 2)} m/s²`],
      ['Where', (s) => (s.r < 1 ? 'inside: g ∝ r' : 'outside: g ∝ 1/r²')],
    ] },
  ],
  tex: (s) => (s.r < 1 ? `g=g_0\\dfrac{r}{R}=${fixed(g(s.r), 3)}\\,g_0` : `g=g_0\\dfrac{R^2}{r^2}=${fixed(g(s.r), 3)}\\,g_0`),
});
