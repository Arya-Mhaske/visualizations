import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { G, flight, height } from './_separable-math.js';

// v' = −g − k v on the way up and down. Separating gives the time up, ln(1 + k v0/g)/k; the way down has to be found numerically.
const state = { v0: 20, k: 0.3, t: 1.5 };

createTool({
  state,
  label: 'Height of a ball thrown straight up, plotted against time, with air resistance. A dashed curve shows the same throw with no air. With air resistance the ball rises for a shorter time than it falls, so the curve leans to the left. A time slider moves a marker.',
  setup: (stage, c) => createPlot(stage, { x: [0, 5], y: [0, 25], c, pad: 22 }),
  draw(ctx, stage, c, plot) {
    const f = flight(state.v0, state.k);
    const free = (2 * state.v0) / G;
    plot.setRange([0, free * 1.05], [0, (state.v0 * state.v0) / (2 * G) * 1.1]);
    plot.axes({ xLabel: 't (s)', yLabel: 'height (m)' });
    plot.fn((t) => height(state.v0, 0, t), { color: c.grid, width: 3, dash: [6, 5], domain: [0, free] });
    plot.fn((t) => height(state.v0, state.k, t), { color: c.a, width: 4, domain: [0, f.land] });
    plot.segment(f.up, 0, f.up, f.top, { color: c.b, width: 3, dash: [4, 3] });
    plot.point(f.up, f.top, { fill: c.fillB, r: 7 });
    plot.point(f.land, 0, { fill: c.fillA, r: 6 });
    const t = Math.min(state.t, f.land);
    plot.point(t, height(state.v0, state.k, t), { fill: c.fillY, r: 8 });
  },
  controls: [
    { title: 'Throw the ball up' },
    { key: 'k', label: 'Air resistance k', min: 0, max: 1, step: 0.05, format: (n) => fixed(n, 2) },
    { key: 'v0', label: 'Launch speed', min: 5, max: 40, step: 5, format: (n) => `${n} m/s` },
    { key: 't', label: 'Time', min: 0, max: 8, step: 0.1, format: (n) => `${fixed(n, 1)} s` },
    { readout: [
      ['Time up', (s) => `${fixed(flight(s.v0, s.k).up, 2)} s`],
      ['Time down', (s) => `${fixed(flight(s.v0, s.k).down, 2)} s`],
      ['Highest point', (s) => `${fixed(flight(s.v0, s.k).top, 1)} m`],
      ['Average speed up', (s) => `${fixed(flight(s.v0, s.k).top / flight(s.v0, s.k).up, 2)} m/s`],
      ['Average speed down', (s) => `${fixed(flight(s.v0, s.k).top / flight(s.v0, s.k).down, 2)} m/s`],
      ['Landing speed', (s) => `${fixed(flight(s.v0, s.k).landSpeed, 2)} m/s`],
    ] },
  ],
  tex: (s) => `t_{\\text{up}}=\\dfrac{1}{k}\\ln\\!\\left(1+\\dfrac{kv_0}{g}\\right)=${fixed(flight(s.v0, s.k).up, 2)}\\ \\text{s},\\qquad t_{\\text{down}}=${fixed(flight(s.v0, s.k).down, 2)}\\ \\text{s}`,
});
