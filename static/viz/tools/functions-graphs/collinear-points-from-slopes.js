import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { handles } from '../../lib/stage.js';
import { fixed } from '../../lib/format.js';

const state = { ax: -4, ay: -3, bx: 0, by: -1, cx: 4, cy: 1 };
const R = 8;
const P = (s = state) => [[s.ax, s.ay], [s.bx, s.by], [s.cx, s.cy]];
// slopes as exact fractions: compare cross-multiplied so no rounding is involved
const dyx = (p, q) => ({ dy: q[1] - p[1], dx: q[0] - p[0] });
const collinear = (s = state) => { const u = dyx(P(s)[0], P(s)[1]); const v = dyx(P(s)[1], P(s)[2]); return u.dy * v.dx === v.dy * u.dx; };
const text = (p, q) => { const { dy, dx } = dyx(p, q); return dx === 0 ? 'undefined (vertical)' : fixed(dy / dx, 3); };

const tool = createTool({
  state,
  label: 'Three points A, B and C that you can drag on the grid. The slope of the segment AB and the slope of BC are shown. If the two slopes are equal the three points lie on a single line, and the segments join up straight. If not, there is a bend at B.',
  setup: (stage, c) => createPlot(stage, { x: [-R, R], y: [-R, R], c, pad: 16 }),
  draw(ctx, stage, c, plot) {
    plot.axes();
    const [A, B, C] = P();
    const ok = collinear();
    plot.segment(A[0], A[1], B[0], B[1], { color: c.a, width: 4 });
    plot.segment(B[0], B[1], C[0], C[1], { color: c.b, width: 4 });
    if (ok) plot.segment(A[0], A[1], C[0], C[1], { color: c.c, width: 2, dash: [5, 4] });
    [['A', A], ['B', B], ['C', C]].forEach(([n, p]) => { plot.point(p[0], p[1], { fill: ok ? c.c : c.fillY, r: 9 }); plot.text(n, p[0] + 0.5, p[1] + 0.6, { size: 13, patch: false }); });
  },
  controls: [
    { title: 'Drag the three points' },
    { text: 'Drag A, B or C. Enter switches point; arrow keys nudge it.' },
    { readout: [
      ['Slope of AB', (s) => text(P(s)[0], P(s)[1])],
      ['Slope of BC', (s) => text(P(s)[1], P(s)[2])],
      ['Collinear?', (s) => ({ text: collinear(s) ? 'yes: equal slopes' : 'no: they bend', good: collinear(s) })],
    ] },
  ],
  tex: (s) => `m_{AB}=\\dfrac{${s.by - s.ay}}{${s.bx - s.ax}},\\ m_{BC}=\\dfrac{${s.cy - s.by}}{${s.cx - s.bx}}\\ ${collinear(s) ? '\\Rightarrow\\ \\text{equal: A, B, C on one line}' : '\\Rightarrow\\ \\text{not equal}'}`,
});

const grab = (xk, yk) => ({
  at: () => tool.extra.toPx(state[xk], state[yk]),
  move(px, py) { const [x, y] = tool.extra.toWorld(px, py); state[xk] = Math.max(-7, Math.min(7, Math.round(x))); state[yk] = Math.max(-7, Math.min(7, Math.round(y))); },
  get keyStep() { return Math.abs(tool.extra.toPx(1, 0)[0] - tool.extra.toPx(0, 0)[0]); },
});
handles(tool.stage, [grab('ax', 'ay'), grab('bx', 'by'), grab('cx', 'cy')], { onChange: () => tool.update(), radius: 26 });
tool.update();
