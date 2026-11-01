import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { handles } from '../../lib/stage.js';
import { fixed } from '../../lib/format.js';
import { dist } from './_conics-math.js';

const R = 8;
const state = { a: 2, x: 3, y: 4, snap: true };
const trail = [];
let tool;
const F = (s = state) => [s.a, 0];
const dF = (s = state) => dist([s.x, s.y], F(s));
const dL = (s = state) => s.x + s.a;

function place(x, y) {
  if (state.snap) {
    const px = Math.max(0, Math.min(R - 0.5, x));
    state.x = px;
    state.y = (y < 0 ? -1 : 1) * 2 * Math.sqrt(state.a * px);
  } else {
    state.x = Math.max(-state.a, Math.min(R - 0.5, x));
    state.y = Math.max(-R + 0.5, Math.min(R - 0.5, y));
  }
  if (state.snap && !trail.some((p) => Math.hypot(p[0] - state.x, p[1] - state.y) < 0.15)) trail.push([state.x, state.y]);
}

tool = createTool({
  state,
  label: 'A focus F, a vertical line called the directrix, and a point P you can drag. Two segments show the distance from P to the focus and the distance from P straight across to the directrix. When the two distances are equal, P is on the parabola, and a trail of such points builds up the curve.',
  setup: (stage, c) => createPlot(stage, { x: [-R, R], y: [-R, R], c, pad: 18 }),
  draw(ctx, stage, c, plot) {
    plot.axes();
    plot.segment(-state.a, -R, -state.a, R, { color: c.b, width: 4 });
    plot.text('directrix', -state.a - 0.2, R - 1, { size: 11, color: c.b, align: 'right', patch: false });
    plot.point(state.a, 0, { fill: c.c, r: 8 });
    plot.text('F', state.a + 0.5, -0.7, { size: 13, patch: false });
    trail.forEach(([x, y]) => plot.point(x, y, { fill: c.fillY, r: 3 }));
    const eq = Math.abs(dF() - dL()) < 0.06;
    plot.segment(state.x, state.y, state.a, 0, { color: c.a, width: 3 });
    plot.segment(state.x, state.y, -state.a, state.y, { color: c.b, width: 3 });
    plot.point(state.x, state.y, { fill: eq ? c.c : c.a, r: 9 });
    plot.text('P', state.x + 0.5, state.y + 0.6, { size: 13, patch: false });
  },
  controls: (t) => [
    { title: 'Drag the point P' },
    { key: 'a', label: 'Focus distance, a', min: 1, max: 4, step: 0.5 },
    { key: 'snap', label: 'Keep the distances equal (leaves a trail)', toggle: true },
    { button: 'Clear the trail', ghost: true, onClick: () => { trail.length = 0; tool.update(); } },
    { readout: [
      ['PF (coral)', (s) => fixed(dF(s), 2)],
      ['P to directrix (blue)', (s) => fixed(dL(s), 2)],
      ['Difference', (s) => ({ text: fixed(dF(s) - dL(s), 2), good: Math.abs(dF(s) - dL(s)) < 0.06 })],
    ] },
  ],
  onChange(s) {
    if (s.snap) place(s.x, s.y);
    trail.length = 0;
  },
  tex: (s) => `PF=${fixed(dF(s), 2)},\\quad d(P,\\text{directrix})=${fixed(dL(s), 2)}${Math.abs(dF(s) - dL(s)) < 0.06 ? '\\ \\Rightarrow\\ y^2=4ax' : ''}`,
});

handles(tool.stage, [{
  at: () => tool.extra.toPx(state.x, state.y),
  move(px, py) { const [x, y] = tool.extra.toWorld(px, py); place(x, y); },
  keyStep: 10,
  nudge(d) { place(state.x + d * 0.5, state.y); },
}], { onChange: () => tool.update(), radius: 28 });
place(state.x, state.y);
tool.update();
