import { plotTool } from '../../lib/recipes.js';
import { fixed } from '../../lib/format.js';
import { G } from '../../lib/quick.js';

const state = { w: 40, r: 0.3, t: 0 };
const [m, I] = [2, 0.15];
const Om = (s) => (m * G * s.r) / (I * s.w);

plotTool({
  state,
  label: 'A view from above of the angular momentum vector of a hanging bicycle wheel. It has fixed length and turns round a circle at the precession rate, because the torque from the weight is always sideways to it.',
  x: [-1.2, 1.2],
  y: [-1.2, 1.2],
  range: () => [[-1.2, 1.2], [-1.2, 1.2]],
  segments: (s, c) => [[0, 0, Math.cos(Om(s) * s.t), Math.sin(Om(s) * s.t), { color: c.a, width: 5 }], [Math.cos(Om(s) * s.t), Math.sin(Om(s) * s.t), Math.cos(Om(s) * s.t) - 0.3 * Math.sin(Om(s) * s.t), Math.sin(Om(s) * s.t) + 0.3 * Math.cos(Om(s) * s.t), { color: c.c, width: 3 }]],
  curves: (s, c) => [[(x) => Math.sqrt(Math.max(0, 1 - x * x)), { color: c.grid, dash: [4, 4], domain: [-1, 1] }], [(x) => -Math.sqrt(Math.max(0, 1 - x * x)), { color: c.grid, dash: [4, 4], domain: [-1, 1] }]],
  points: (s, c) => [[Math.cos(Om(s) * s.t), Math.sin(Om(s) * s.t), c.a, 7]],
  texts: () => [['L (spin)', 0, 1.12, {}], ['torque: sideways', 0, -1.12, {}]],
  controls: [
    { title: 'The hanging wheel' },
    { key: 'w', label: 'Spin ω (rad/s)', min: 10, max: 100, step: 5 },
    { key: 'r', label: 'Pivot distance r (m)', min: 0.1, max: 0.5, step: 0.05 },
    { key: 't', label: 'Time (s)', min: 0, max: 20, step: 0.1 },
    { readout: [
      ['Precession rate Ω = mgr/(Iω)', (s) => `${fixed(Om(s), 3)} rad/s`],
      ['Time for one turn', (s) => `${fixed((2 * Math.PI) / Om(s), 1)} s`],
      ['Size of L', (s) => `${fixed(I * s.w, 2)} kg m²/s (unchanged)`],
    ] },
  ],
  tex: (s) => `\\Omega=\\dfrac{\\tau}{L}=\\dfrac{mgr}{I\\omega}=${fixed(Om(s), 3)}\\ \\mathrm{rad/s}`,
});
