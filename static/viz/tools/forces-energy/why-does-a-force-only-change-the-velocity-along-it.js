import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

const state = { vx: 2, F: 2, d: 1 };
const M = 1;
const vy = (s) => (s.F * s.d) / M;
const at = (s, t) => (t <= s.d ? [s.vx * t, 0.5 * (s.F / M) * t * t] : [s.vx * t, 0.5 * (s.F / M) * s.d * s.d + vy(s) * (t - s.d)]);

createTool({
  state,
  label: 'The path of a puck moving to the right that is pushed sideways for a short time. The sideways speed grows during the push, while the speed to the right is unchanged.',
  setup: (stage, c) => createPlot(stage, { x: [0, 12], y: [0, 12], c }),
  draw(ctx, stage, c, plot) {
    plot.setRange([0, 12], [0, 12]);
    plot.axes({ xLabel: 'x (m)', yLabel: 'y (m)' });
    const pts = Array.from({ length: 61 }, (_, i) => at(state, (i / 60) * 5));
    pts.slice(1).forEach((p, i) => plot.segment(pts[i][0], pts[i][1], p[0], p[1], { color: i / 60 * 5 <= state.d ? c.a : c.b, width: 4 }));
  },
  controls: [
    { title: 'A sideways push' },
    { key: 'vx', label: 'Speed along x (m/s)', min: 0.5, max: 3, step: 0.5 },
    { key: 'F', label: 'Sideways force (N, puck 1 kg)', min: 0, max: 4, step: 0.5 },
    { key: 'd', label: 'Push lasts (s)', min: 0.25, max: 2, step: 0.25 },
    { readout: [
      ['v along x', (s) => `${fixed(s.vx, 2)} m/s (unchanged)`],
      ['v along y after', (s) => `${fixed(vy(s), 2)} m/s`],
      ['Final speed', (s) => `${fixed(Math.hypot(s.vx, vy(s)), 2)} m/s`],
    ] },
  ],
  tex: (s) => `\\Delta v_y=\\dfrac{F\\,\\Delta t}{m}=${fixed(vy(s), 2)},\\quad \\Delta v_x=0`,
});
