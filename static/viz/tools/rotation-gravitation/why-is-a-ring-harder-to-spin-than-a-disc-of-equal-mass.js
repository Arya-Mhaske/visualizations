import { plotTool } from '../../lib/recipes.js';
import { fixed } from '../../lib/format.js';

const state = { tau: 2, M: 4, R: 0.5, t: 3 };
const Iring = (s) => s.M * s.R * s.R;
const Idisc = (s) => 0.5 * s.M * s.R * s.R;

plotTool({
  state,
  label: 'Angular speed against time for a ring and a disc of the same mass and radius under the same torque. The disc line is twice as steep.',
  x: [0, 6],
  y: [0, 20],
  xLabel: 't (s)',
  yLabel: 'ω (rad/s)',
  range: (s) => [[0, 6], [0, (s.tau / Idisc(s)) * 6 * 1.05]],
  curves: (s, c) => [[(t) => (s.tau / Iring(s)) * t, { color: c.a }], [(t) => (s.tau / Idisc(s)) * t, { color: c.b }]],
  points: (s, c) => [[s.t, (s.tau / Iring(s)) * s.t, c.a], [s.t, (s.tau / Idisc(s)) * s.t, c.b]],
  texts: (s) => [['ring', 5.5, (s.tau / Iring(s)) * 5.5 + 0.5, {}], ['disc', 5.5, (s.tau / Idisc(s)) * 5.5 + 0.5, {}]],
  controls: [
    { title: 'The same torque' },
    { key: 'tau', label: 'Torque (N m)', min: 0.5, max: 5, step: 0.5 },
    { key: 'M', label: 'Mass (kg)', min: 1, max: 10, step: 1 },
    { key: 'R', label: 'Radius (m)', min: 0.2, max: 1, step: 0.1 },
    { key: 't', label: 'Time (s)', min: 0, max: 6, step: 0.5 },
    { readout: [
      ['I of ring | disc', (s) => `${fixed(Iring(s), 3)} | ${fixed(Idisc(s), 3)} kg m²`],
      ['α of ring | disc', (s) => `${fixed(s.tau / Iring(s), 2)} | ${fixed(s.tau / Idisc(s), 2)} rad/s²`],
      ['ω now', (s) => `${fixed((s.tau / Iring(s)) * s.t, 2)} | ${fixed((s.tau / Idisc(s)) * s.t, 2)} rad/s`],
    ] },
  ],
  tex: (s) => `\\alpha=\\dfrac{\\tau}{I}:\\ I_{\\text{ring}}=MR^2,\\ I_{\\text{disc}}=\\tfrac12MR^2`,
});
