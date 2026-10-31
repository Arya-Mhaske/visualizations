import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { handles } from '../../lib/stage.js';
import { fixed } from '../../lib/format.js';
import { fromVelocity } from './_motion-in-a-straight-line-math.js';

const STEP = 2;
const state = { knots: [0, 4, 4, 0, -3, 0], x0: 0 };
const END = STEP * (state.knots.length - 1);
const VMAX = 6;
const VIEW = 1 / 3;
const row = (i) => (stage) => ({ x: 0, y: (stage.h * i) / 3, w: stage.w, h: stage.h * VIEW });
const piece = (t) => Math.min(Math.floor(t / STEP), state.knots.length - 2);
const solved = () => fromVelocity(state.knots, STEP, state.x0);
const v = (t) => {
  const i = piece(t);
  return state.knots[i] + ((state.knots[i + 1] - state.knots[i]) * (t - i * STEP)) / STEP;
};
function x(t) {
  const i = piece(t);
  const s = t - i * STEP;
  return solved().xs[i] + (state.knots[i] + v(t)) / 2 * s;
}
const a = (t) => solved().as[piece(t)];

const tool = createTool({
  state,
  label: 'Three stacked graphs of position, velocity and acceleration against time. The velocity points can be dragged and the other two graphs follow.',
  setup: (stage, c) => ({
    xs: createPlot(stage, { x: [0, END], c, box: row(0) }),
    vs: createPlot(stage, { x: [0, END], y: [-VMAX, VMAX], c, box: row(1) }),
    as: createPlot(stage, { x: [0, END], y: [-4, 4], c, box: row(2) }),
  }),
  draw(ctx, stage, c, { xs, vs, as }) {
    const values = solved().xs;
    xs.setRange([0, END], [Math.min(0, ...values) - 2, Math.max(0, ...values) + 2]);
    xs.axes({ xLabel: 't', yLabel: 'x (m)' });
    xs.fn(x, { color: c.b, domain: [0, END] });
    vs.axes({ xLabel: 't', yLabel: 'v (m/s)' });
    vs.shade(v, null, 0, END, c.fillC);
    vs.fn(v, { color: c.a, domain: [0, END] });
    state.knots.forEach((value, i) => vs.point(i * STEP, value));
    as.axes({ xLabel: 't (s)', yLabel: 'a (m/s²)' });
    as.fn(a, { color: c.d, domain: [0, END] });
  },
  controls: [
    { title: 'Drag the velocity points' },
    { text: 'Change v on the middle graph. Slope gives a, area gives x.' },
    { key: 'x0', label: 'Starting position', min: -5, max: 5, step: 1, format: (n) => `${n} m` },
    { readout: [
      ['Final position', () => `${fixed(solved().xs[state.knots.length - 1], 1)} m`],
      ['Displacement (net area)', () => `${fixed(solved().xs[state.knots.length - 1] - state.x0, 1)} m`],
      ['Greatest |a|', () => `${fixed(Math.max(...solved().as.map(Math.abs)), 1)} m/s²`],
      ['Velocity points', () => state.knots.map((k) => fixed(k, 1)).join(', ')],
    ] },
  ],
  tex: () => `\\Delta x = \\text{net area under } v\\text{–}t = ${fixed(solved().xs[state.knots.length - 1] - state.x0, 1).replace('−', '-')}\\ \\text{m}`,
});

handles(tool.stage, state.knots.map((_, i) => ({
  at: () => tool.extra.vs.toPx(i * STEP, state.knots[i]),
  move(px, py) {
    const value = tool.extra.vs.toWorld(px, py)[1];
    state.knots[i] = Math.max(-VMAX, Math.min(VMAX, Math.round(value * 2) / 2));
  },
  keyStep: 10,
})), { onChange: tool.update });
