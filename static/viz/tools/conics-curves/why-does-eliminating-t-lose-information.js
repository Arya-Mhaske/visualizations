import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { arrow } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { curve, fitEqual, trace } from './_conics-view.js';

const state = { motion: 0, t: 1 };
const TAU = Math.PI * 2;
const MOTIONS = [
  { name: 'once, anticlockwise', f: (t) => [3 * Math.cos(t), 3 * Math.sin(t)], tex: 'x=3\\cos t,\\ y=3\\sin t', span: TAU, info: 'once round, anticlockwise' },
  { name: 'once, clockwise', f: (t) => [3 * Math.cos(t), -3 * Math.sin(t)], tex: 'x=3\\cos t,\\ y=-3\\sin t', span: TAU, info: 'once round, clockwise' },
  { name: 'twice as fast, two laps', f: (t) => [3 * Math.cos(2 * t), 3 * Math.sin(2 * t)], tex: 'x=3\\cos 2t,\\ y=3\\sin 2t', span: TAU, info: 'two laps, anticlockwise' },
  { name: 'starting at the top', f: (t) => [3 * Math.sin(t), 3 * Math.cos(t)], tex: 'x=3\\sin t,\\ y=3\\cos t', span: TAU, info: 'once round, clockwise, starting at (0, 3)' },
];
const at = (s = state) => MOTIONS[s.motion].f(s.t * MOTIONS[s.motion].span);

createTool({
  state,
  label: 'A circle of radius 3 traced by four different parametric motions. If you eliminate the parameter t from any of them you get the same equation, x squared plus y squared equals 9. The picture shows what the equation forgets: which way the point goes round, where it starts, and how many times it goes round.',
  setup: (stage, c) => createPlot(stage, { x: [-4, 4], y: [-4, 4], c, pad: 14 }),
  draw(ctx, stage, c, plot) {
    fitEqual(plot, stage, 0, 0, 4);
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    const m = MOTIONS[state.motion];
    curve(plot, trace((u) => m.f(u * m.span), 0, state.t, Math.max(2, Math.round(state.t * 200))), { color: c.a, width: 5 });
    const start = m.f(0);
    plot.point(start[0], start[1], { fill: c.c, r: 8 });
    plot.text('start', start[0] + 0.3, start[1] + 0.5, { size: 11, align: 'left', patch: false });
    const [p, q] = [m.f(state.t * m.span), m.f(Math.min(1, state.t + 0.01) * m.span)];
    if (state.t < 1) arrow(ctx, ...plot.toPx(...p), ...plot.toPx(p[0] + (q[0] - p[0]) * 6, p[1] + (q[1] - p[1]) * 6), { color: c.b, width: 3 });
    plot.point(p[0], p[1], { fill: c.fillY, r: 9 });
  },
  controls: [
    { title: 'Four motions on one circle' },
    { key: 'motion', label: 'Motion', min: 0, max: MOTIONS.length - 1, step: 1, format: (v) => MOTIONS[v].name },
    { key: 't', label: 'How far through, t', min: 0, max: 1, step: 0.01, format: (v) => `${Math.round(v * 100)}%` },
    { readout: [
      ['What the motion does', (s) => MOTIONS[s.motion].info],
      ['After eliminating t', () => 'x² + y² = 9 (the same!)'],
      ['Point now', (s) => `(${fixed(at(s)[0], 2)}, ${fixed(at(s)[1], 2)})`],
    ] },
  ],
  tex: (s) => `${MOTIONS[s.motion].tex}\\ \\Rightarrow\\ x^2+y^2=9`,
});
