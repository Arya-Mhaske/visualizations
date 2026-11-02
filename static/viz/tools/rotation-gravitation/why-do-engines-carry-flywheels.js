import { plotTool } from '../../lib/recipes.js';
import { fixed } from '../../lib/format.js';

const state = { I: 2 };
const W0 = 100;
const swing = (I) => 80 / (I * 25);
const w = (I, t) => W0 - swing(I) * Math.cos(25 * t);

plotTool({
  state,
  label: 'Shaft speed against time for an engine with pulsing torque. A light flywheel gives big swings in speed and a heavy flywheel gives almost steady speed.',
  x: [0, 1],
  y: [90, 110],
  xLabel: 't (s)',
  yLabel: 'ω (rad/s)',
  range: () => [[0, 1], [90, 110]],
  curves: (s, c) => [[(t) => w(0.5, t), { color: c.grid, dash: [5, 5] }], [(t) => w(s.I, t), { color: c.a }]],
  controls: [
    { title: 'The flywheel' },
    { key: 'I', label: 'Moment of inertia I (kg m²)', min: 0.5, max: 10, step: 0.5 },
    { readout: [
      ['Speed swings by ±', (s) => `${fixed(swing(s.I), 2)} rad/s`],
      ['As a share of ω', (s) => `${fixed((swing(s.I) / W0) * 100, 2)}%`],
    ] },
  ],
  tex: (s) => `\\Delta\\omega\\propto\\dfrac{1}{I}=${fixed(swing(s.I), 2)}\\ \\mathrm{rad/s}`,
});
