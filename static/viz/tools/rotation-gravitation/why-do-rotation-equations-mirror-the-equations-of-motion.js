import { plotTool } from '../../lib/recipes.js';
import { fixed } from '../../lib/format.js';

const state = { w0: 2, al: 1.5, t: 4 };
const th = (s, t = s.t) => s.w0 * t + 0.5 * s.al * t * t;
const w = (s, t = s.t) => s.w0 + s.al * t;

plotTool({
  state,
  label: 'Angular velocity against time for constant angular acceleration, a straight line, with the area under it shaded as the angle turned. The same picture works for velocity and distance.',
  x: [0, 8],
  y: [0, 16],
  xLabel: 't (s)',
  yLabel: 'ω (rad/s)  [or v (m/s)]',
  range: (s) => [[0, 8], [0, w(s, 8) * 1.05 + 1]],
  shades: (s, c) => [[(t) => w(s, t), null, 0, s.t, c.fillA]],
  curves: (s, c) => [[(t) => w(s, t), { color: c.ink }]],
  points: (s, c) => [[s.t, w(s), c.a]],
  controls: [
    { title: 'Constant α (or a)' },
    { key: 'w0', label: 'ω₀ (or v₀)', min: 0, max: 6, step: 0.5 },
    { key: 'al', label: 'α (or a)', min: 0, max: 3, step: 0.25 },
    { key: 't', label: 'Time t (s)', min: 0, max: 8, step: 0.5 },
    { readout: [
      ['ω = ω₀ + αt   |   v = v₀ + at', (s) => `${fixed(w(s), 2)}  |  ${fixed(w(s), 2)}`],
      ['θ = ω₀t + ½αt²   |   x = v₀t + ½at²', (s) => `${fixed(th(s), 2)}  |  ${fixed(th(s), 2)}`],
      ['ω² − ω₀²   |   2αθ', (s) => `${fixed(w(s) ** 2 - s.w0 ** 2, 2)}  |  ${fixed(2 * s.al * th(s), 2)}`],
    ] },
  ],
  tex: (s) => `\\theta=\\omega_0t+\\tfrac12\\alpha t^2=${fixed(th(s), 2)}\\ \\mathrm{rad}`,
});
