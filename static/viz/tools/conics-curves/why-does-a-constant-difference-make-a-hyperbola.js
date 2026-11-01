import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { handles } from '../../lib/stage.js';
import { fixed } from '../../lib/format.js';
import { dist, hyperbolaPoint } from './_conics-math.js';
import { curve, trace } from './_conics-view.js';

const state = { a: 2, c: 4, t: 0.9, side: 1, snap: true, x: 4, y: 2 };
const trail = [];
const R = 9;
let tool;
const b = (s = state) => Math.sqrt(s.c * s.c - s.a * s.a);
const d1 = (s = state) => dist([s.x, s.y], [-s.c, 0]);
const d2 = (s = state) => dist([s.x, s.y], [s.c, 0]);
const diff = (s = state) => Math.abs(d1(s) - d2(s));

function place(x, y) {
  if (state.snap) {
    const side = x < 0 ? -1 : 1;
    const ax = Math.max(state.a, Math.abs(x));
    const t = Math.acosh(Math.min(ax / state.a, 4.5));
    const p = hyperbolaPoint(state.a, b(), y < 0 ? -t : t, side);
    state.x = p[0];
    state.y = p[1];
    if (!trail.some((q) => Math.hypot(q[0] - state.x, q[1] - state.y) < 0.2)) trail.push([state.x, state.y]);
  } else {
    state.x = Math.max(-R + 0.5, Math.min(R - 0.5, x));
    state.y = Math.max(-R + 0.5, Math.min(R - 0.5, y));
  }
}

tool = createTool({
  state,
  label: 'Two foci and a point P you can drag. The two distances from P to the foci are shown. When P is placed so that the difference between those distances stays equal to 2a, it lies on a hyperbola, and a trail builds up both branches. Take the difference the other way round and you reach the second branch.',
  setup: (stage, c) => createPlot(stage, { x: [-R, R], y: [-R, R], c, pad: 16 }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: '', yLabel: '' });
    trail.forEach(([x, y]) => plot.point(x, y, { fill: c.fillY, r: 3 }));
    [-state.c, state.c].forEach((x) => plot.point(x, 0, { fill: c.c, r: 8 }));
    plot.segment(-state.c, 0, state.x, state.y, { color: c.a, width: 3 });
    plot.segment(state.c, 0, state.x, state.y, { color: c.b, width: 3 });
    plot.point(state.x, state.y, { fill: Math.abs(diff() - 2 * state.a) < 0.05 ? c.c : c.a, r: 9 });
    plot.text('F₁', -state.c, -0.8, { size: 12, patch: false });
    plot.text('F₂', state.c, -0.8, { size: 12, patch: false });
  },
  controls: [
    { title: 'Drag the point P' },
    { key: 'a', label: 'a (half the fixed difference)', min: 1, max: 3, step: 0.5 },
    { key: 'c', label: 'c (distance of each focus)', min: 3.5, max: 6, step: 0.5 },
    { key: 'snap', label: 'Keep the difference at 2a (leaves a trail)', toggle: true },
    { button: 'Clear the trail', ghost: true, onClick: () => { trail.length = 0; tool.update(); } },
    { readout: [
      ['d₁ (coral)', (s) => fixed(d1(s), 2)],
      ['d₂ (blue)', (s) => fixed(d2(s), 2)],
      ['|d₁ − d₂|', (s) => ({ text: fixed(diff(s), 2), good: Math.abs(diff(s) - 2 * s.a) < 0.05 })],
      ['2a', (s) => fixed(2 * s.a, 2)],
    ] },
  ],
  onChange(s) { if (s.c <= s.a + 0.5) s.c = s.a + 1; place(s.x, s.y); trail.length = 0; },
  tex: (s) => `|d_1-d_2|=|${fixed(d1(s), 2)}-${fixed(d2(s), 2)}|=${fixed(diff(s), 2)}${Math.abs(diff(s) - 2 * s.a) < 0.05 ? `=2a` : ''}`,
});

handles(tool.stage, [{
  at: () => tool.extra.toPx(state.x, state.y),
  move(px, py) { const [x, y] = tool.extra.toWorld(px, py); place(x, y); },
  keyStep: 10,
  nudge(dir) { place(state.x + dir * 0.5, state.y); },
}], { onChange: () => tool.update(), radius: 30 });
place(state.x, state.y);
tool.update();
