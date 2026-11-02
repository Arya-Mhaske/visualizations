import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

const state = { F: 50, v: 4 };

createTool({
  state,
  label: 'Work against time for a steady force on a moving object: a straight line whose slope is the power F times v.',
  setup: (stage, c) => createPlot(stage, { x: [0, 10], y: [0, 2000], c }),
  draw(ctx, stage, c, plot) {
    plot.setRange([0, 10], [0, 2100]);
    plot.axes({ xLabel: 't (s)', yLabel: 'W (J)' });
    plot.fn((t) => state.F * state.v * t, { color: c.b });
    plot.segment(6, state.F * state.v * 6, 8, state.F * state.v * 6, { color: c.ink, width: 2 });
    plot.segment(8, state.F * state.v * 6, 8, state.F * state.v * 8, { color: c.a, width: 3 });
    plot.text('Δt', 7, state.F * state.v * 6 - 80, { patch: false });
    plot.text('F v Δt', 8.2, state.F * state.v * 7, { align: 'left', patch: false });
  },
  controls: [
    { title: 'A steady pull' },
    { key: 'F', label: 'Force F (N)', min: 10, max: 100, step: 5 },
    { key: 'v', label: 'Speed v (m/s)', min: 1, max: 10, step: 1 },
    { readout: [
      ['Distance in 1 s', (s) => `${s.v} m`],
      ['Work in 1 s', (s) => `${s.F * s.v} J`],
      ['Power P = Fv', (s) => `${fixed(s.F * s.v, 0)} W`],
    ] },
  ],
  tex: (s) => `P=\\dfrac{dW}{dt}=\\vec F\\cdot\\vec v=${s.F}\\times${s.v}=${s.F * s.v}\\ \\mathrm{W}`,
});
