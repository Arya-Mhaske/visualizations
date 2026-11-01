import { createTool } from '../../lib/tool.js';
import { handles } from '../../lib/stage.js';
import { arrow, dot, label, line, poly } from '../../lib/draw.js';
import { fixed, sig } from '../../lib/format.js';
import { axisLoop, elementField, loopPieces } from './_sources-of-magnetic-field-math.js';

// The loop lies in the plane x = 0 and its axis is the x axis. Lengths in cm on the stage, metres in the maths.
const state = { x: 5, R: 5, I: 5, N: 8 };
const X_MAX = 24;
const m = (cm) => cm / 100;
const point = (s = state) => [m(s.x), 0, 0];
const ring = (s = state) => loopPieces(m(s.R), s.N);
const parts = (s = state) => ring(s).map((piece) => elementField(s.I, piece, point(s)));
const sum = (s = state) => parts(s).reduce((t, b) => [t[0] + b[0], t[1] + b[1], t[2] + b[2]], [0, 0, 0]);
const micro = (t) => `${sig(t * 1e6, 3)} µT`;
// The two pieces at the top and bottom of the loop, drawn edge-on in the side view.
const arcLength = (s) => m(s.R) * 0.05;
const top = (s = state) => ({ p: [0, m(s.R), 0], dl: [0, 0, arcLength(s)] });
const bottom = (s = state) => ({ p: [0, -m(s.R), 0], dl: [0, 0, -arcLength(s)] });

function side(ctx, stage, c) {
  const h = stage.h * 0.5;
  const s = Math.min((stage.w - 56) / X_MAX, (h * 0.42) / 8);
  const [x0, y0] = [40, h / 2];
  const px = (x) => x0 + x * s;
  line(ctx, 8, y0, stage.w - 8, y0, { color: c.ink, width: 2, dash: [10, 4] });
  line(ctx, x0, y0 - state.R * s, x0, y0 + state.R * s, { color: c.ink, width: 5 });
  for (const [sign, isOut] of [[1, true], [-1, false]]) {
    const [cx, cy] = [x0, y0 - sign * state.R * s];
    dot(ctx, cx, cy, 11, c.paper, c.ink);
    if (isOut) dot(ctx, cx, cy, 3, c.ink);
    else {
      line(ctx, cx - 5, cy - 5, cx + 5, cy + 5, { color: c.ink, width: 3 });
      line(ctx, cx - 5, cy + 5, cx + 5, cy - 5, { color: c.ink, width: 3 });
    }
  }
  const P = [px(state.x), y0];
  const unit = (state.R * s * 0.62) / elementField(state.I, top(), [0, 0, 0]).map(Math.abs).reduce((a, b) => Math.max(a, b)); // the on-axis piece at x = 0 sets the scale
  const pairs = [[top(), c.a, 1], [bottom(), c.b, -1]];
  for (const [piece, colour, sign] of pairs) {
    const edge = [x0, y0 - sign * state.R * s];
    line(ctx, edge[0], edge[1], P[0], P[1], { color: colour, width: 1.5, dash: [4, 4] });
    const b = elementField(state.I, piece, point());
    const tip = [P[0] + b[0] * unit, P[1] - b[1] * unit];
    line(ctx, P[0], P[1], tip[0], P[1], { color: c.c, width: 2, dash: [3, 3] });
    line(ctx, tip[0], P[1], tip[0], tip[1], { color: c.d, width: 2, dash: [3, 3] });
    arrow(ctx, P[0], P[1], tip[0], tip[1], { color: colour, width: 3, head: 9 });
  }
  const total = P[0] + 2 * elementField(state.I, top(), point())[0] * unit;
  arrow(ctx, P[0], P[1] + 18, total, P[1] + 18, { color: c.c, width: 5, head: 12 });
  dot(ctx, P[0], P[1], 7, c.paper, c.ink);
  label(ctx, 'Two opposite pieces', 8, 12, c, { size: 11, align: 'left', bounds: stage, patch: false });
  label(ctx, 'Green: along the axis. Purple: sideways.', 8, h - 8, c, { size: 11, align: 'left', bounds: stage, patch: false });
}

function end(ctx, stage, c) {
  const [top0, height] = [stage.h * 0.5, stage.h * 0.5];
  line(ctx, 0, top0, stage.w, top0, { color: c.ink, width: 3 });
  const list = parts();
  const size = Math.hypot(list[0][1], list[0][2]);
  const cx = stage.w / 2;
  const cy = top0 + height * 0.55;
  label(ctx, `Sideways parts of ${state.N} pieces, end to end`, 8, top0 + 14, c, { size: 11, align: 'left', bounds: stage, patch: false });
  if (size < 1e-12) {
    label(ctx, 'At the centre there is no sideways part.', cx, cy, c, { size: 12, bounds: stage });
    return;
  }
  const k = ((height * 0.34) * 2 * Math.PI) / (state.N * size);
  // Start the chain where it will come back round: the polygon sits centred on (cx, cy).
  const path = [[0, 0]];
  for (const b of list) {
    const [px, py] = path[path.length - 1];
    path.push([px + b[1] * k, py - b[2] * k]);
  }
  const mid = path.reduce((t, p) => [t[0] + p[0] / path.length, t[1] + p[1] / path.length], [0, 0]);
  const at = path.map(([x, y]) => [cx + x - mid[0], cy + y - mid[1]]);
  poly(ctx, at, { fill: c.fillY, stroke: c.ink, width: 2, closed: false });
  for (let i = 0; i < list.length; i++) {
    arrow(ctx, ...at[i], ...at[i + 1], { color: i % 2 ? c.d : c.b, width: 3, head: 9 });
  }
  dot(ctx, ...at[0], 5, c.paper, c.ink);
  const gap = Math.hypot(at[list.length][0] - at[0][0], at[list.length][1] - at[0][1]);
  label(ctx, gap < 0.5 ? 'It closes: the sum is zero' : `Gap: ${fixed(gap, 1)}`, cx, top0 + height - 12, c, { size: 12, bounds: stage });
}

const tool = createTool({
  state,
  label: 'Top: the loop seen edge on, with its top and bottom pieces and the sideways and along-axis parts of their fields at a point on the axis. Bottom: the sideways parts of all the pieces drawn end to end, which close into a ring so they add to zero.',
  draw(ctx, stage, c) {
    side(ctx, stage, c);
    end(ctx, stage, c);
  },
  controls: () => [
    { title: 'Move along the axis' },
    { key: 'x', label: 'Distance along the axis, x', min: 0, max: X_MAX, step: 0.5, format: (n) => `${fixed(n, 1)} cm` },
    { key: 'R', label: 'Loop radius, R', min: 3, max: 8, step: 0.5, format: (n) => `${fixed(n, 1)} cm` },
    { key: 'I', label: 'Current, I', min: 1, max: 10, format: (n) => `${n} A` },
    { key: 'N', label: 'Pieces in the loop', min: 2, max: 24, step: 2, format: (n) => `${n}` },
    { readout: [
      ['Along the axis', (s) => micro(sum(s)[0])],
      ['Sideways total', (s) => ({ text: Math.hypot(sum(s)[1], sum(s)[2]) < 1e-9 * Math.max(1e-12, Math.abs(sum(s)[0])) ? '0 µT' : micro(Math.hypot(sum(s)[1], sum(s)[2])), good: true })],
      ['At the centre', (s) => micro(axisLoop(s.I, m(s.R), 0))],
      ['Share of centre', (s) => `${fixed((axisLoop(s.I, m(s.R), m(s.x)) / axisLoop(s.I, m(s.R), 0)) * 100, 1)} %`],
    ] },
  ],
  tex: (s) => `B=\\dfrac{\\mu_0 I R^2}{2\\,(x^2+R^2)^{3/2}}=\\dfrac{\\mu_0\\,(${s.I})(${fixed(m(s.R), 3)})^2}{2\\,(${fixed(m(s.x) ** 2 + m(s.R) ** 2, 4)})^{3/2}}=${micro(axisLoop(s.I, m(s.R), m(s.x)))}`,
});

handles(tool.stage, [{
  at: () => {
    const h = tool.stage.h * 0.5;
    const s = Math.min((tool.stage.w - 56) / X_MAX, (h * 0.42) / 8);
    return [40 + state.x * s, h / 2];
  },
  move(px) {
    const h = tool.stage.h * 0.5;
    const s = Math.min((tool.stage.w - 56) / X_MAX, (h * 0.42) / 8);
    state.x = Math.max(0, Math.min(X_MAX, Math.round(((px - 40) / s) * 2) / 2));
  },
  keyStep: 8,
}], { onChange: () => tool.update(), radius: 28 });
