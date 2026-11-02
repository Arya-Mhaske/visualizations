import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

const state = { E: 0.6, x: 2 };
const V = (x) => (x * x - 4) ** 2 / 16;
const turning = (E) => {
  const out = [];
  for (let i = 0; i < 800; i++) {
    const [a, b] = [-4 + i * 0.01, -4 + (i + 1) * 0.01];
    if ((V(a) - E) * (V(b) - E) < 0) out.push(a + (0.01 * (E - V(a))) / (V(b) - V(a)));
  }
  return out;
};

createTool({
  state,
  label: 'A double-well potential energy curve with a horizontal line for the total energy. Regions where the curve is above the line are shaded as forbidden, and the ball sits where it is allowed.',
  setup: (stage, c) => createPlot(stage, { x: [-4, 4], y: [0, 3], c }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'x', yLabel: 'energy' });
    const pts = [-4, ...turning(state.E), 4];
    for (let i = 0; i < pts.length - 1; i++) {
      const mid = (pts[i] + pts[i + 1]) / 2;
      if (V(mid) > state.E) plot.shade(V, () => state.E, pts[i], pts[i + 1], c.fillA);
    }
    plot.fn(V, { color: c.b });
    plot.segment(-4, state.E, 4, state.E, { color: c.a, width: 3 });
    turning(state.E).forEach((x) => plot.point(x, state.E, { fill: c.ink, r: 5 }));
    if (V(state.x) <= state.E) plot.point(state.x, V(state.x), { fill: c.c, r: 8 });
  },
  controls: [
    { title: 'Energy and position' },
    { key: 'E', label: 'Total energy E', min: 0.05, max: 2.5, step: 0.05 },
    { key: 'x', label: 'Ball at x', min: -4, max: 4, step: 0.1 },
    { readout: [
      ['Turning points', (s) => turning(s.E).map((x) => fixed(x, 2)).join(', ') || 'none'],
      ['Kinetic energy E − V', (s) => (V(s.x) <= s.E ? fixed(s.E - V(s.x), 3) : 'forbidden here')],
    ] },
  ],
  tex: (s) => `K=E-V(x)\\ge0\\ \\Rightarrow\\ V(x)\\le E`,
});
