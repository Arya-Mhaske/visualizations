import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { arrow } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { TAU } from './_waves-math.js';

const state = { A1: 1, f1: 1, A2: 0.8, f2: 3, ph: 0, x: 0.3 };
const w1 = (x) => state.A1 * Math.sin(TAU * state.f1 * x);
const w2 = (x) => state.A2 * Math.sin(TAU * state.f2 * x + (state.ph * Math.PI) / 180);

createTool({
  state,
  label: 'Two sine waves, one coral and one blue, and their sum in green. A vertical line at x shows the coral height and the blue height stacked tip to tail, ending exactly on the green curve.',
  setup: (stage, c) => createPlot(stage, { x: [0, 2], y: [-2.4, 2.4], c, pad: 24 }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    plot.fn(w1, { color: c.a, width: 3 });
    plot.fn(w2, { color: c.b, width: 3 });
    plot.fn((x) => w1(x) + w2(x), { color: c.c, width: 5 });
    const x = state.x;
    plot.segment(x, -2.4, x, 2.4, { color: c.grid, width: 1 });
    arrow(ctx, ...plot.toPx(x, 0), ...plot.toPx(x, w1(x)), { color: c.a, width: 4, head: 9 });
    arrow(ctx, ...plot.toPx(x, w1(x)), ...plot.toPx(x, w1(x) + w2(x)), { color: c.b, width: 4, head: 9 });
    plot.point(x, w1(x) + w2(x), { fill: c.c });
  },
  controls: [
    { title: 'Wave 1 (coral)' },
    { key: 'A1', label: 'Height, A₁', min: 0, max: 1.5, step: 0.1, format: (n) => fixed(n, 1) },
    { key: 'f1', label: 'Cycles per unit, f₁', min: 0.5, max: 4, step: 0.5, format: (n) => fixed(n, 1) },
    { title: 'Wave 2 (blue)' },
    { key: 'A2', label: 'Height, A₂', min: 0, max: 1.5, step: 0.1, format: (n) => fixed(n, 1) },
    { key: 'f2', label: 'Cycles per unit, f₂', min: 0.5, max: 6, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'ph', label: 'Shift of wave 2', min: 0, max: 360, step: 15, format: (n) => `${n}°` },
    { title: 'Where to add' },
    { key: 'x', label: 'Position, x', min: 0, max: 2, step: 0.02, format: (n) => fixed(n, 2) },
    { readout: [
      ['Wave 1 here', (s) => fixed(w1(s.x), 3)],
      ['Wave 2 here', (s) => fixed(w2(s.x), 3)],
      ['Sum here', (s) => fixed(w1(s.x) + w2(s.x), 3)],
    ] },
  ],
  tex: (s) => `y=${fixed(w1(s.x), 2)}+(${fixed(w2(s.x), 2)})=${fixed(w1(s.x) + w2(s.x), 2)}`,
});
