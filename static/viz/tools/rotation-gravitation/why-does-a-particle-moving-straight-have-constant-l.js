import { plotTool } from '../../lib/recipes.js';
import { fixed } from '../../lib/format.js';

const state = { x: -3, d: 2, m: 1.5, v: 3 };

plotTool({
  state,
  label: 'A particle on a straight horizontal path with a radius vector drawn from the origin to it. The perpendicular distance from the origin to the path is d, and stays fixed as the particle moves.',
  x: [-6, 6],
  y: [-1, 5],
  range: () => [[-6, 6], [-1, 5]],
  segments: (s, c) => [[-6, s.d, 6, s.d, { color: c.ink, width: 2, dash: [5, 4] }], [0, 0, s.x, s.d, { color: c.b, width: 3 }], [0, 0, 0, s.d, { color: c.c, width: 4 }]],
  points: (s, c) => [[s.x, s.d, c.a, 8], [0, 0, c.ink, 5]],
  texts: (s) => [['d', 0.3, s.d / 2, {}]],
  controls: [
    { title: 'A particle on a line' },
    { key: 'x', label: 'Position along the path', min: -5, max: 5, step: 0.5 },
    { key: 'd', label: 'Distance d from the origin', min: 0, max: 4, step: 0.5 },
    { key: 'm', label: 'Mass (kg)', min: 0.5, max: 3, step: 0.5 },
    { key: 'v', label: 'Speed (m/s)', min: 1, max: 6, step: 1 },
    { readout: [
      ['r sin θ (= d)', (s) => fixed(s.d, 2)],
      ['L = m v d', (s) => `${fixed(s.m * s.v * s.d, 2)} kg m²/s`],
      ['|r|', (s) => fixed(Math.hypot(s.x, s.d), 2)],
    ] },
  ],
  tex: (s) => `L=mvd=${s.m}\\times${s.v}\\times${s.d}=${fixed(s.m * s.v * s.d, 2)}`,
});
