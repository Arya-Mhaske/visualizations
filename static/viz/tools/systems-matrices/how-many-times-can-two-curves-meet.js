import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { contour } from '../vectors-3d/_quadric-surfaces-math.js';
import { rad } from './_sm-math.js';

// Curve 1 is the one we walk along (a parametrisation p(t), t in [0, 1)). Curve 2 is implicit, g2(x, y) = 0.
// Each sign change of g2 along curve 1 is a meeting point; bisection pins it down.
const MODES = {
  circleLine: { name: 'Line and circle', g1: (x, y) => x * x + y * y - 9, p1: (t) => [3 * Math.cos(2 * Math.PI * t), 3 * Math.sin(2 * Math.PI * t)], closed: true,
    g2: (s) => (x, y) => x * Math.cos(rad(s.a)) + y * Math.sin(rad(s.a)) - s.d, max: 2 },
  circleEllipse: { name: 'Circle and ellipse', g1: (x, y) => (x / 4) ** 2 + (y / 2) ** 2 - 1, p1: (t) => [4 * Math.cos(2 * Math.PI * t), 2 * Math.sin(2 * Math.PI * t)], closed: true,
    g2: (s) => (x, y) => (x - s.h) ** 2 + (y - s.k) ** 2 - s.r * s.r, max: 4 },
  circleParabola: { name: 'Circle and parabola', g1: (x, y) => y - (x * x) / 2 + 2, p1: (t) => { const x = -6 + 12 * t; return [x, (x * x) / 2 - 2]; }, closed: false,
    g2: (s) => (x, y) => (x - s.h) ** 2 + (y - s.k) ** 2 - s.r * s.r, max: 4 },
};
const state = { mode: 'circleEllipse', a: 30, d: 1, h: 1, k: 0, r: 2.5 };

function meetings(s) {
  const m = MODES[s.mode];
  const g = m.g2(s);
  const N = 2400;
  const at = (i) => m.p1(i / N);
  const out = [];
  let prev = g(...at(0));
  for (let i = 1; i <= N; i++) {
    const cur = g(...at(i % N === 0 && m.closed ? 0 : i));
    if (prev === 0 || prev * cur < 0) {
      let [lo, hi] = [(i - 1) / N, i / N];
      for (let k = 0; k < 40; k++) { const mid = (lo + hi) / 2; if (g(...m.p1(lo)) * g(...m.p1(mid)) <= 0) hi = mid; else lo = mid; }
      out.push(m.p1((lo + hi) / 2));
    }
    prev = cur;
  }
  return out.filter((p, i) => out.findIndex((q) => Math.hypot(p[0] - q[0], p[1] - q[1]) < 1e-4) === i);
}

createTool({
  state,
  label: 'Two curves on one graph and the points where they meet. A line can meet a circle in 0, 1 or 2 points. A circle and an ellipse, or a circle and a parabola, can meet in up to 4 points. The meeting points are marked and counted as you move the second curve.',
  setup: (stage, c) => createPlot(stage, { x: [-6, 6], y: [-6, 6], c, pad: 14 }),
  draw(ctx, stage, c, plot) {
    const m = MODES[state.mode];
    plot.axes({ grid: false });
    for (const [a, b] of contour(m.g1, -6, 6, 120)) plot.segment(a[0], a[1], b[0], b[1], { color: c.a, width: 4 });
    for (const [a, b] of contour(m.g2(state), -6, 6, 120)) plot.segment(a[0], a[1], b[0], b[1], { color: c.b, width: 4 });
    for (const p of meetings(state)) plot.point(p[0], p[1], { fill: c.fillY, r: 8 });
  },
  controls: [
    { title: 'Move the second curve' },
    { key: 'mode', label: 'Curves', options: Object.entries(MODES).map(([key, v]) => [key, v.name]) },
    { key: 'a', label: 'Line: direction of its normal', min: 0, max: 175, step: 5, format: (n) => `${n}°` },
    { key: 'd', label: 'Line: distance from the origin', min: -5, max: 5, step: 0.25, format: (n) => fixed(n, 2) },
    { key: 'h', label: 'Circle: centre x', min: -4, max: 4, step: 0.25, format: (n) => fixed(n, 2) },
    { key: 'k', label: 'Circle: centre y', min: -4, max: 4, step: 0.25, format: (n) => fixed(n, 2) },
    { key: 'r', label: 'Circle: radius', min: 0.5, max: 5, step: 0.25, format: (n) => fixed(n, 2) },
    { readout: [
      ['Meeting points', (s) => ({ text: String(meetings(s).length), good: meetings(s).length > 0 })],
      ['Most possible for this pair', (s) => String(MODES[s.mode].max)],
      ['Where', (s) => meetings(s).map((p) => `(${fixed(p[0], 2)}, ${fixed(p[1], 2)})`).join(' ') || 'none'],
    ] },
  ],
  tex: () => '\\text{degree 2 and degree 2: at most }2\\times2=4\\text{ meetings}',
  onChange: (s) => show(s),
});
const fields = [...document.querySelectorAll('#panel .nb-field')];
function show(s) {
  if (fields.length < 6) return;
  const line = s.mode === 'circleLine';
  fields[1].hidden = !line;
  fields[2].hidden = !line;
  fields[3].hidden = line;
  fields[4].hidden = line;
  fields[5].hidden = line;
}
show(state);
