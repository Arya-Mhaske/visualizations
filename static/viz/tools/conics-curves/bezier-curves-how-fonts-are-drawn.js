import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { handles } from '../../lib/stage.js';
import { fixed } from '../../lib/format.js';
import { deCasteljau } from './_rotation-math.js';
import { curve, trace } from './_conics-view.js';

const state = { cubic: true, t: 0.4, x0: -6, y0: -3, x1: -4, y1: 6, x2: 4, y2: 6, x3: 6, y3: -3 };
const R = 8;
let tool;
const pts = (s = state) => [[s.x0, s.y0], [s.x1, s.y1], [s.x2, s.y2], [s.x3, s.y3]].slice(0, s.cubic ? 4 : 3).map((p, i, a) => (!s.cubic && i === 2 ? [s.x3, s.y3] : p));
const at = (s = state) => deCasteljau(pts(s), s.t);

tool = createTool({
  state,
  label: 'A Bézier curve and its control points. The curve starts at the first point and ends at the last, and the middle points pull it towards them without lying on it. The straight lines show how the point at time t is built by repeatedly taking a fraction t of the way along each segment, which is how the curve is computed. Drag any point and the curve follows.',
  setup: (stage, c) => createPlot(stage, { x: [-R, R], y: [-R, R], c, pad: 14 }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: '', yLabel: '', grid: false });
    const P = pts();
    curve(plot, trace((t) => deCasteljau(P, t).at(-1)[0], 0, 1, 160), { color: c.a, width: 4 });
    for (let i = 1; i < P.length; i++) plot.segment(P[i - 1][0], P[i - 1][1], P[i][0], P[i][1], { color: c.grid, width: 2, dash: [5, 4] });
    const levels = at();
    levels.slice(1, -1).forEach((level, k) => {
      const colour = [c.b, c.c, c.d][k % 3];
      for (let i = 1; i < level.length; i++) plot.segment(level[i - 1][0], level[i - 1][1], level[i][0], level[i][1], { color: colour, width: 3 });
      level.forEach((p) => plot.point(p[0], p[1], { fill: colour, r: 5 }));
    });
    const last = levels.at(-1)[0];
    plot.point(last[0], last[1], { fill: c.fillY, r: 9 });
    P.forEach((p, i) => { plot.point(p[0], p[1], { fill: c.paper, r: 8 }); plot.text(`P${i}`, p[0] + 0.5, p[1] + 0.7, { size: 11, patch: false }); });
  },
  controls: [
    { title: 'Shape the curve' },
    { key: 'cubic', label: 'Cubic (4 points) instead of quadratic (3)', toggle: true },
    { key: 't', label: 'Time along the curve, t', min: 0, max: 1, step: 0.01, format: (v) => fixed(v, 2) },
    { text: 'Drag the points P0 to P3, or focus one and use arrow keys. Enter switches point.' },
    { readout: [
      ['Point on the curve', (s) => `(${fixed(at(s).at(-1)[0][0], 2)}, ${fixed(at(s).at(-1)[0][1], 2)})`],
      ['Starts at', (s) => `(${s.x0}, ${s.y0})`],
      ['Ends at', (s) => `(${s.x3}, ${s.y3})`],
    ] },
  ],
  tex: (s) => (s.cubic
    ? `B(t)=(1-t)^3P_0+3(1-t)^2t\\,P_1+3(1-t)t^2P_2+t^3P_3`
    : `B(t)=(1-t)^2P_0+2(1-t)t\\,P_1+t^2P_2`),
});

const grab = (xk, yk, hidden = () => false) => ({
  at: () => (hidden() ? [-1e5, -1e5] : tool.extra.toPx(state[xk], state[yk])),
  move(px, py) {
    const [x, y] = tool.extra.toWorld(px, py);
    state[xk] = Math.max(-R + 0.5, Math.min(R - 0.5, Math.round(x * 4) / 4));
    state[yk] = Math.max(-R + 0.5, Math.min(R - 0.5, Math.round(y * 4) / 4));
  },
  get keyStep() { return Math.abs(tool.extra.toPx(1, 0)[0] - tool.extra.toPx(0, 0)[0]) / 2; },
});
// In quadratic mode P2 is hidden: the curve uses P0, P1 and the last point (labelled P2 on screen)
handles(tool.stage, [grab('x0', 'y0'), grab('x1', 'y1'), grab('x2', 'y2', () => !state.cubic), grab('x3', 'y3')], { onChange: () => tool.update(), radius: 26 });
tool.update();
