import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { handles } from '../../lib/stage.js';
import { fixed } from '../../lib/format.js';
import { distToPoint, foot, lineFrom, onLine, pointLine } from './_coordinate-plane-math.js';

const R = 8;
const state = { m: 0.5, q: 1, x: -4, qx: 2, qy: -3 };
const Q = (s = state) => [s.qx, s.qy];
const L = (s = state) => lineFrom(s.m, s.q);
const P = (s = state) => onLine(s.m, s.q, s.x);
const F = (s = state) => foot(L(s), Q(s));
const dist = (s = state, x = s.x) => distToPoint(s.m, s.q, x, Q(s));

function angleAtP(s) {
  const p = P(s);
  const u = [1, s.m];
  const v = [Q(s)[0] - p[0], Q(s)[1] - p[1]];
  const cos = (u[0] * v[0] + u[1] * v[1]) / (Math.hypot(...u) * Math.hypot(...v) || 1);
  return (Math.acos(Math.max(-1, Math.min(1, cos))) * 180) / Math.PI;
}

const tool = createTool({
  state,
  label: 'Top: a coordinate plane with a straight line, a fixed point Q off the line and a movable point P on the line, joined to Q by a segment. A small square marks the right angle at the foot of the perpendicular. Bottom: a graph of the distance PQ against the position of P, a curve with a lowest point exactly where the segment meets the line at 90 degrees.',
  setup: (stage, c) => ({
    top: createPlot(stage, { x: [-R, R], y: [-R, R], c, pad: 18, box: (g) => ({ x: 0, y: 0, w: g.w, h: g.h * 0.62 }) }),
    low: createPlot(stage, { x: [-R, R], y: [0, 14], c, pad: 18, box: (g) => ({ x: 0, y: g.h * 0.62, w: g.w, h: g.h * 0.38 }) }),
  }),
  draw(ctx, stage, c, { top, low }) {
    top.axes({ grid: false });
    top.fn((x) => state.m * x + state.q, { color: c.b, width: 4 });
    const p = P();
    const q = Q();
    const f = F();
    top.segment(f[0], f[1], q[0], q[1], { color: c.c, width: 2, dash: [6, 5] });
    top.segment(p[0], p[1], q[0], q[1], { color: c.a, width: 4 });
    top.point(f[0], f[1], { fill: c.c, r: 5 });
    top.point(q[0], q[1], { fill: c.fillY, r: 9 });
    top.point(p[0], p[1], { fill: c.a, r: 9 });
    top.text('Q', q[0] + 0.7, q[1] - 0.8, { size: 13 });
    top.text('P', p[0] + 0.5, p[1] + 0.9, { size: 13 });
    low.axes({ grid: false, xLabel: 'P', yLabel: 'PQ' });
    low.fn((x) => dist(state, x), { color: c.a });
    low.point(state.x, dist(), { fill: c.a, r: 7 });
    low.point(f[0], pointLine(L(), q), { fill: c.c, r: 6 });
  },
  controls: () => [
    { title: 'The line and the point' },
    { key: 'x', label: 'Position of P along the line, x', min: -7, max: 7, step: 0.1, format: (n) => fixed(n, 1) },
    { key: 'm', label: 'Slope of the line, m', min: -2, max: 2, step: 0.25 },
    { text: 'Drag P along the line, or drag Q.' },
    { readout: [
      ['PQ', (s) => fixed(dist(s), 2)],
      ['Least possible PQ', (s) => fixed(pointLine(L(s), Q(s)), 2)],
      ['Angle between PQ and the line', (s) => `${fixed(angleAtP(s), 0)}°`],
      ['Is PQ the shortest?', (s) => (dist(s) - pointLine(L(s), Q(s)) < 0.05 ? { text: 'yes, at 90°', good: true } : { text: 'not yet', good: false })],
    ] },
  ],
  tex: (s) => `d_{\\min}=\\dfrac{|ax_0+by_0+c|}{\\sqrt{a^2+b^2}}=${fixed(pointLine(L(s), Q(s)), 2)},\\quad PQ=${fixed(dist(s), 2)}`,
});

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
handles(tool.stage, [
  {
    at: () => tool.extra.top.toPx(...P()),
    move(px, py) {
      const [wx, wy] = tool.extra.top.toWorld(px, py);
      // drop the pointer onto the line, then read off its x
      state.x = clamp(Math.round(foot(L(), [wx, wy])[0] * 10) / 10, -7, 7);
    },
    nudge(direction) { state.x = clamp(Math.round((state.x + direction * 0.5) * 10) / 10, -7, 7); },
  },
  {
    at: () => tool.extra.top.toPx(...Q()),
    move(px, py) {
      const [wx, wy] = tool.extra.top.toWorld(px, py);
      state.qx = clamp(Math.round(wx * 2) / 2, -7, 7);
      state.qy = clamp(Math.round(wy * 2) / 2, -7, 7);
    },
    get keyStep() { return Math.abs(tool.extra.top.toPx(0.5, 0)[0] - tool.extra.top.toPx(0, 0)[0]); },
  },
], { onChange: () => tool.update(), radius: 28 });
tool.update();
