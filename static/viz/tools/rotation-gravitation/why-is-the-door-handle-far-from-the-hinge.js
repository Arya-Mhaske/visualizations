import { plotTool } from '../../lib/recipes.js';
import { fixed } from '../../lib/format.js';

const state = { r: 0.8, F: 20, th: 90 };
const tau = (s, r = s.r) => r * s.F * Math.sin((s.th * Math.PI) / 180);

plotTool({
  state,
  label: 'Torque against distance from the hinge: a straight line through the origin whose slope is F sin theta. A marker shows the chosen distance.',
  x: [0, 1],
  y: [0, 20],
  xLabel: 'distance r from the hinge (m)',
  yLabel: 'torque (N m)',
  range: () => [[0, 1], [0, 22]],
  curves: (s, c) => [[(r) => tau(s, r), { color: c.b }]],
  points: (s, c) => [[s.r, tau(s), c.a]],
  controls: [
    { title: 'Push the door' },
    { key: 'r', label: 'Distance r (m)', min: 0.1, max: 1, step: 0.05 },
    { key: 'F', label: 'Force F (N)', min: 5, max: 30, step: 1 },
    { key: 'th', label: 'Angle between push and door θ (°)', min: 0, max: 90, step: 5 },
    { readout: [
      ['Torque τ = rF sin θ', (s) => `${fixed(tau(s), 2)} N m`],
      ['Force needed at r = 0.1 m', (s) => `${fixed(tau(s) / (0.1 * Math.sin((s.th * Math.PI) / 180) || 1), 0)} N`],
    ] },
  ],
  tex: (s) => `\\tau=rF\\sin\\theta=${s.r}\\times${s.F}\\times\\sin${s.th}^\\circ=${fixed(tau(s), 2)}\\ \\mathrm{N\\,m}`,
});
