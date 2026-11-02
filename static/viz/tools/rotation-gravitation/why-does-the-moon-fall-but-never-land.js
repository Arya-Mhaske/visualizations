import { plotTool } from '../../lib/recipes.js';
import { sig } from '../../lib/format.js';

const state = { r: 60.3 };
const fall = (r) => (0.5 * 9.8) / (r * r); // metres in 1 s

plotTool({
  state,
  label: 'The distance fallen in one second against distance from the centre of the Earth in Earth radii, on a log scale. It falls as the inverse square, from 4.9 metres at the surface to about 1.4 millimetres at the Moon.',
  x: [0, 2],
  y: [-4, 1],
  xLabel: 'log₁₀ (distance in Earth radii)',
  yLabel: 'log₁₀ (fall in 1 s, metres)',
  range: () => [[-0.05, 2], [-4, 1]],
  curves: (s, c) => [[(x) => Math.log10(fall(10 ** x)), { color: c.b }]],
  points: (s, c) => [[0, Math.log10(fall(1)), c.c], [Math.log10(60.3), Math.log10(fall(60.3)), c.d], [Math.log10(s.r), Math.log10(fall(s.r)), c.a, 8]],
  texts: () => [['apple', 0.05, 0.4, { align: 'left' }], ['Moon', 1.85, -2.3, {}]],
  controls: [
    { title: 'How far from the Earth\'s centre?' },
    { key: 'r', label: 'Distance (Earth radii)', min: 1, max: 100, step: 0.1 },
    { readout: [
      ['Falls in 1 s', (s) => `${sig(fall(s.r) * 1000, 3)} mm`],
      ['Acceleration', (s) => `${sig(9.8 / (s.r * s.r), 3)} m/s²`],
      ['Ratio to the apple', (s) => `1 : ${sig(s.r * s.r, 4)}`],
    ] },
  ],
  tex: (s) => `a=g\\left(\\dfrac{R_E}{r}\\right)^2=\\dfrac{9.8}{${s.r}^2}=${sig(9.8 / (s.r * s.r), 3)}\\ \\mathrm{m/s^2}`,
});
