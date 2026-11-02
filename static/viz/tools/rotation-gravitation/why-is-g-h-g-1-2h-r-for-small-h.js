import { plotTool } from '../../lib/recipes.js';
import { fixed } from '../../lib/format.js';

const state = { h: 500 };
const R = 6371;
const exact = (h) => 1 / (1 + h / R) ** 2;
const approx = (h) => 1 - (2 * h) / R;

plotTool({
  state,
  label: 'Gravity against height above the Earth: the exact inverse-square curve and the straight line approximation, which agree for small heights and separate for large ones.',
  x: [0, 3000],
  y: [0.4, 1],
  xLabel: 'height h (km)',
  yLabel: 'g / g₀',
  range: () => [[0, 3200], [0.3, 1.02]],
  curves: (s, c) => [[exact, { color: c.b }], [approx, { color: c.a, dash: [6, 5] }]],
  points: (s, c) => [[s.h, exact(s.h), c.b], [s.h, approx(s.h), c.a, 5]],
  controls: [
    { title: 'Height' },
    { key: 'h', label: 'Height h (km)', min: 1, max: 3000, step: 1 },
    { readout: [
      ['Exact g/g₀', (s) => fixed(exact(s.h), 5)],
      ['Approximate 1 − 2h/R', (s) => fixed(approx(s.h), 5)],
      ['Error', (s) => `${fixed(Math.abs(exact(s.h) - approx(s.h)) * 100, 3)}% of g₀`],
    ] },
  ],
  tex: (s) => `g(h)=g\\left(1+\\dfrac hR\\right)^{-2}\\approx g\\left(1-\\dfrac{2h}{R}\\right)`,
});
