import { createTool } from '../../lib/tool.js';
import { arc, dot, TAU } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { rad } from './_la-math.js';
import { plane, vec } from './_la-view.js';

// The shadow of w on the line of v can never be longer than w itself: it is the short side of a right triangle.
const state = { va: 20, wa: 80, len: 3, vl: 2 };
const dirOf = (a) => [Math.cos(rad(a)), Math.sin(rad(a))];
const parts = (s) => {
  const v = dirOf(s.va);
  const w = dirOf(s.wa).map((x) => x * s.len);
  const k = v[0] * w[0] + v[1] * w[1]; // signed shadow length (v is a unit direction)
  return { v, w, k, foot: v.map((x) => x * k) };
};

createTool({
  state,
  label: 'A circle of radius equal to the length of w. The vector w ends on the circle. Its shadow on the line of v is the foot of a perpendicular, which always lies inside the circle, so the shadow is never longer than w. With v of length one, the dot product equals the shadow length.',
  setup: (stage, c) => plane(stage, c, 4),
  draw(ctx, stage, c, plot) {
    const { v, w, foot } = parts(state);
    plot.axes({ grid: false });
    plot.segment(-4 * v[0], -4 * v[1], 4 * v[0], 4 * v[1], { color: c.grid, width: 2 });
    const [cx, cy] = plot.toPx(0, 0);
    arc(ctx, cx, cy, plot.toPx(state.len, 0)[0] - cx, 0, TAU, { color: c.grid, width: 2, dash: [6, 5] });
    plot.segment(w[0], w[1], foot[0], foot[1], { color: c.grid, width: 2, dash: [5, 4] });
    plot.segment(0, 0, foot[0], foot[1], { color: c.c, width: 9 });
    vec(ctx, plot, c, [0, 0], v.map((x) => x * state.vl), { color: c.a, width: 4, text: 'v' });
    vec(ctx, plot, c, [0, 0], w, { color: c.b, width: 5, text: 'w' });
    dot(ctx, ...plot.toPx(...foot), 5, c.fillY, c.ink, 2);
  },
  controls: [
    { title: 'Shadow against vector' },
    { key: 'wa', label: 'Direction of w', min: 0, max: 360, step: 5, format: (n) => `${n}°` },
    { key: 'va', label: 'Direction of v', min: 0, max: 360, step: 5, format: (n) => `${n}°` },
    { key: 'vl', label: 'Length of v', min: 1, max: 3.5, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'len', label: 'Length of w', min: 1, max: 3.5, step: 0.5, format: (n) => fixed(n, 1) },
    { readout: [
      ['Shadow of w on v', (s) => fixed(Math.abs(parts(s).k), 3)],
      ['|v · w|', (s) => fixed(s.vl * Math.abs(parts(s).k), 3)],
      ['|v||w|', (s) => fixed(s.vl * s.len, 3)],
      ['|v · w| ÷ |v||w|', (s) => ({ text: fixed(Math.abs(parts(s).k) / s.len, 3), good: true })],
    ] },
  ],
  tex: (s) => `|\\mathbf v\\cdot\\mathbf w|=${fixed(s.vl * Math.abs(parts(s).k), 3)}\\ \\le\\ |\\mathbf v||\\mathbf w|=${fixed(s.vl * s.len, 3)}`,
});
