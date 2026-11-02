import { plotTool } from '../../lib/recipes.js';
import { fixed } from '../../lib/format.js';

const state = { r0: 1200, r1: 3120, t: 16 };
const rad = (r) => (r * 2 * Math.PI) / 60;
const al = (s) => (rad(s.r1) - rad(s.r0)) / s.t;
const turns = (s) => (0.5 * (rad(s.r0) + rad(s.r1)) * s.t) / (2 * Math.PI);

plotTool({
  state,
  label: 'Angular velocity against time for a motor speeding up steadily. The shaded area under the line is the total angle turned.',
  x: [0, 20],
  y: [0, 400],
  xLabel: 't (s)',
  yLabel: 'ω (rad/s)',
  range: (s) => [[0, s.t * 1.1], [0, rad(Math.max(s.r0, s.r1)) * 1.15]],
  shades: (s, c) => [[(t) => rad(s.r0) + al(s) * t, null, 0, s.t, c.fillA]],
  curves: (s, c) => [[(t) => rad(s.r0) + al(s) * t, { color: c.ink, domain: [0, s.t] }]],
  points: (s, c) => [[0, rad(s.r0), c.b], [s.t, rad(s.r1), c.a]],
  controls: [
    { title: 'The motor' },
    { key: 'r0', label: 'Starting speed (rpm)', min: 0, max: 3000, step: 60 },
    { key: 'r1', label: 'Final speed (rpm)', min: 0, max: 4000, step: 60 },
    { key: 't', label: 'Time t (s)', min: 2, max: 30, step: 1 },
    { readout: [
      ['ω₀ and ω', (s) => `${fixed(rad(s.r0), 1)} and ${fixed(rad(s.r1), 1)} rad/s`],
      ['α', (s) => `${fixed(al(s), 2)} rad/s²`],
      ['Angle turned', (s) => `${fixed(turns(s) * 2 * Math.PI, 0)} rad`],
      ['Revolutions', (s) => fixed(turns(s), 1)],
    ] },
  ],
  tex: (s) => `\\alpha=\\dfrac{\\omega-\\omega_0}{t}=${fixed(al(s), 2)}\\ \\mathrm{rad/s^2},\\quad N=${fixed(turns(s), 1)}`,
});
