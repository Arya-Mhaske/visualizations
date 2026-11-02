import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

const state = { fx: 3, fy: 4, dx: 4, dy: -2 };
const W = (s) => s.fx * s.dx + s.fy * s.dy;
const ang = (s) => (Math.acos(W(s) / (Math.hypot(s.fx, s.fy) * Math.hypot(s.dx, s.dy) || 1)) * 180) / Math.PI;

createTool({
  state,
  label: 'A force vector and a displacement vector drawn from the origin. The work is their dot product, and the angle between them is shown.',
  setup: (stage, c) => createPlot(stage, { x: [-8, 8], y: [-8, 8], c }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    plot.segment(0, 0, state.fx, state.fy, { color: c.a, width: 4 });
    plot.segment(0, 0, state.dx, state.dy, { color: c.b, width: 4 });
    plot.point(state.fx, state.fy, { fill: c.a });
    plot.point(state.dx, state.dy, { fill: c.b });
  },
  controls: [
    { title: 'Force F (N) and displacement d (m)' },
    { key: 'fx', label: 'Fₓ', min: -8, max: 8, step: 1 },
    { key: 'fy', label: 'F_y', min: -8, max: 8, step: 1 },
    { key: 'dx', label: 'dₓ', min: -8, max: 8, step: 1 },
    { key: 'dy', label: 'd_y', min: -8, max: 8, step: 1 },
    { readout: [
      ['W = F · d', (s) => `${fixed(W(s), 1)} J`],
      ['Angle between', (s) => `${fixed(ang(s), 1)}°`],
      ['Work is', (s) => (W(s) > 0 ? 'positive' : W(s) < 0 ? 'negative' : 'zero')],
    ] },
  ],
  tex: (s) => `W=F_xd_x+F_yd_y=${s.fx}\\times${s.dx}+${s.fy}\\times${s.dy}=${fixed(W(s), 1)}`,
});
