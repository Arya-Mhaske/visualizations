import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { G } from '../../lib/quick.js';

const state = { th: 15, R: 100, mu: 0.3 };
const rad = (d) => (d * Math.PI) / 180;
const v0 = (R, th) => Math.sqrt(R * G * Math.tan(rad(th)));
const vmax = (s, th = s.th) => Math.sqrt((s.R * G * (Math.tan(rad(th)) + s.mu)) / (1 - s.mu * Math.tan(rad(th))));
const vmin = (s, th = s.th) => Math.sqrt(Math.max(0, (s.R * G * (Math.tan(rad(th)) - s.mu)) / (1 + s.mu * Math.tan(rad(th)))));

createTool({
  state,
  label: 'Speed against bank angle: the ideal speed with no friction, and the highest and lowest safe speeds with friction. A marker shows the chosen angle.',
  setup: (stage, c) => createPlot(stage, { x: [0, 40], y: [0, 70], c }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'bank angle θ (°)', yLabel: 'v (m/s)' });
    plot.fn((th) => vmax(state, Math.min(th, 38)), { color: c.a });
    plot.fn((th) => v0(state.R, th), { color: c.c });
    plot.fn((th) => vmin(state, th), { color: c.b });
    plot.point(state.th, v0(state.R, state.th), { fill: c.c });
  },
  controls: [
    { title: 'Bank the road' },
    { key: 'th', label: 'Bank angle θ (°)', min: 0, max: 38, step: 1 },
    { key: 'R', label: 'Radius R (m)', min: 30, max: 300, step: 10 },
    { key: 'mu', label: 'Friction μₛ (for the safe range)', min: 0, max: 0.6, step: 0.05 },
    { readout: [
      ['Ideal speed (no friction)', (s) => `${fixed(v0(s.R, s.th), 1)} m/s`],
      ['Safe range with friction', (s) => `${fixed(vmin(s), 1)} to ${fixed(vmax(s), 1)} m/s`],
    ] },
  ],
  tex: (s) => `v_0=\\sqrt{Rg\\tan\\theta}=${fixed(v0(s.R, s.th), 1)}\\ \\mathrm{m/s}`,
});
