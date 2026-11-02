import { plotTool } from '../../lib/recipes.js';
import { fixed } from '../../lib/format.js';

const state = { m: 2, r: 0.5, w: 4 };
const I = (s, r = s.r) => 2 * s.m * r * r;

plotTool({
  state,
  label: 'Moment of inertia of two masses on a rod against their distance from the axis: a parabola. Kinetic energy at fixed angular speed follows the same curve.',
  x: [0, 1],
  y: [0, 2],
  xLabel: 'distance r from the axis (m)',
  yLabel: 'I (kg m²)',
  range: (s) => [[0, 1], [0, I(s, 1) * 1.05]],
  curves: (s, c) => [[(r) => I(s, r), { color: c.b }]],
  points: (s, c) => [[s.r, I(s), c.a]],
  controls: [
    { title: 'Two masses on a rod' },
    { key: 'm', label: 'Each mass (kg)', min: 0.5, max: 4, step: 0.5 },
    { key: 'r', label: 'Distance r (m)', min: 0.1, max: 1, step: 0.05 },
    { key: 'w', label: 'Angular speed ω (rad/s)', min: 1, max: 10, step: 1 },
    { readout: [
      ['I = Σmr²', (s) => `${fixed(I(s), 3)} kg m²`],
      ['KE = ½Iω²', (s) => `${fixed(0.5 * I(s) * s.w ** 2, 2)} J`],
      ['KE as 2 × ½m(ωr)²', (s) => `${fixed(2 * 0.5 * s.m * (s.w * s.r) ** 2, 2)} J`],
    ] },
  ],
  tex: (s) => `K=\\sum\\tfrac12m(\\omega r)^2=\\tfrac12\\Big(\\sum mr^2\\Big)\\omega^2=${fixed(0.5 * I(s) * s.w ** 2, 2)}\\ \\mathrm{J}`,
});
