import { plotTool } from '../../lib/recipes.js';
import { fixed } from '../../lib/format.js';

const state = { tau: 4, I: 2, th: 3 };
const w = (s, th = s.th) => Math.sqrt((2 * s.tau * th) / s.I);

plotTool({
  state,
  label: 'Work done by a steady torque against the angle turned, a straight line, and the kinetic energy of rotation at the same angles. The two coincide.',
  x: [0, 8],
  y: [0, 40],
  xLabel: 'angle θ (rad)',
  yLabel: 'energy (J)',
  range: (s) => [[0, 8], [0, s.tau * 8 * 1.05]],
  curves: (s, c) => [[(th) => s.tau * th, { color: c.a }]],
  points: (s, c) => [[s.th, s.tau * s.th, c.a], [s.th, 0.5 * s.I * w(s) ** 2, c.b, 5]],
  controls: [
    { title: 'A steady torque' },
    { key: 'tau', label: 'Torque τ (N m)', min: 1, max: 5, step: 0.5 },
    { key: 'I', label: 'Moment of inertia I (kg m²)', min: 0.5, max: 5, step: 0.5 },
    { key: 'th', label: 'Angle turned θ (rad)', min: 0.5, max: 8, step: 0.5 },
    { readout: [
      ['Work τθ', (s) => `${fixed(s.tau * s.th, 2)} J`],
      ['ω reached', (s) => `${fixed(w(s), 2)} rad/s`],
      ['KE ½Iω²', (s) => `${fixed(0.5 * s.I * w(s) ** 2, 2)} J`],
      ['α = τ/I', (s) => `${fixed(s.tau / s.I, 2)} rad/s²`],
    ] },
  ],
  tex: (s) => `\\tau\\,d\\theta=d\\!\\left(\\tfrac12I\\omega^2\\right)\\ \\Rightarrow\\ \\tau=I\\alpha=${fixed(s.tau, 1)}`,
});
