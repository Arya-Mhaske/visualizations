import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { uniformV, uniformX } from './_motion-in-a-straight-line-math.js';

const state = { u: 2, a: 1.5, t: 6 };
const END = 10;
const half = (top) => (stage) => ({ x: 0, y: top ? 0 : stage.h / 2, w: stage.w, h: stage.h / 2 });
const position = (t) => uniformX(state.u, state.a, t);
const velocity = (t) => uniformV(state.u, state.a, t);
const range = (values) => [Math.min(0, ...values) * 1.1 - 1, Math.max(0, ...values) * 1.1 + 1];

createTool({
  state,
  label: 'Two graphs for one motion. The slope of the tangent on the position graph equals the height on the velocity graph, and the shaded area on the velocity graph equals the rise on the position graph.',
  setup: (stage, c) => ({
    top: createPlot(stage, { x: [0, END], c, box: half(true) }),
    low: createPlot(stage, { x: [0, END], c, box: half(false) }),
  }),
  draw(ctx, stage, c, { top, low }) {
    const t = state.t;
    top.setRange([0, END], range([0, 2.5, 5, 7.5, 10].map(position)));
    low.setRange([0, END], range([velocity(0), velocity(END)]));
    top.axes({ xLabel: 't (s)', yLabel: 'x (m)' });
    top.fn(position, { color: c.ink });
    top.fn((x) => position(t) + velocity(t) * (x - t), { color: c.a, dash: [6, 5] });
    top.point(t, position(t));
    low.axes({ xLabel: 't (s)', yLabel: 'v (m/s)' });
    low.shade(velocity, null, 0, t, c.fillC);
    low.fn(velocity, { color: c.ink });
    low.point(t, velocity(t));
  },
  controls: [
    { title: 'One motion, two graphs' },
    { key: 't', label: 'Time, t', min: 0.5, max: END, step: 0.1, format: (v) => `${fixed(v, 1)} s` },
    { key: 'u', label: 'Starting velocity, v₀', min: -5, max: 5, step: 0.5, format: (v) => `${fixed(v, 1)} m/s` },
    { key: 'a', label: 'Acceleration, a', min: -2, max: 2, step: 0.1, format: (v) => `${fixed(v, 1)} m/s²` },
    { readout: [
      ['Slope of x–t', (s) => `${fixed(velocity(s.t), 2)} m/s`],
      ['Height of v–t', (s) => `${fixed(velocity(s.t), 2)} m/s`],
      ['Area under v–t', (s) => `${fixed(position(s.t), 2)} m`],
      ['Rise on x–t', (s) => `${fixed(position(s.t), 2)} m`],
    ] },
  ],
  tex: (s) => `\\text{area} = \\text{(m/s)} \\times \\text{s} = \\text{m}:\\quad \\int_0^{${fixed(s.t, 1)}} v\\,dt = ${fixed(position(s.t), 2)}\\ \\text{m}`,
});
