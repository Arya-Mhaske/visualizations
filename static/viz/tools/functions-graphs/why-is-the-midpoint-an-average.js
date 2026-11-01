import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { handles } from '../../lib/stage.js';
import { fixed } from '../../lib/format.js';
import { midpoint } from './_coordinate-plane-math.js';

const R = 8;
const state = { x1: -4, y1: -3, x2: 2, y2: 5, bars: true };
const A = (s = state) => [s.x1, s.y1];
const B = (s = state) => [s.x2, s.y2];

const tool = createTool({
  state,
  label: 'A coordinate plane with two draggable points A and B and the segment between them. Dashed lines drop from each point to both axes. On the x-axis, a green dot sits halfway between the two feet. On the y-axis, a green dot sits halfway between the two heights. Lines from those two dots meet at the midpoint M of AB.',
  setup: (stage, c) => createPlot(stage, { x: [-R, R], y: [-R, R], c, pad: 18 }),
  draw(ctx, stage, c, plot) {
    plot.axes();
    const [a, b] = [A(), B()];
    const m = midpoint(a, b);
    if (state.bars) {
      for (const p of [a, b]) {
        plot.segment(p[0], p[1], p[0], 0, { color: c.grid, width: 2, dash: [5, 4] });
        plot.segment(p[0], p[1], 0, p[1], { color: c.grid, width: 2, dash: [5, 4] });
      }
      plot.segment(a[0], 0, b[0], 0, { color: c.a, width: 5 });
      plot.segment(0, a[1], 0, b[1], { color: c.b, width: 5 });
      plot.segment(m[0], m[1], m[0], 0, { color: c.c, width: 2, dash: [5, 4] });
      plot.segment(m[0], m[1], 0, m[1], { color: c.c, width: 2, dash: [5, 4] });
      plot.point(m[0], 0, { fill: c.c, r: 6 });
      plot.point(0, m[1], { fill: c.c, r: 6 });
    }
    plot.segment(a[0], a[1], b[0], b[1], { color: c.ink, width: 4 });
    plot.point(a[0], a[1], { fill: c.fillY, r: 9 });
    plot.point(b[0], b[1], { fill: c.fillY, r: 9 });
    plot.point(m[0], m[1], { fill: c.c, r: 9 });
    plot.text('M', m[0] + 0.8, m[1] - 0.8, { size: 13 });
    plot.text('A', a[0] - 0.7, a[1] + 0.7, { size: 13 });
    plot.text('B', b[0] + 0.7, b[1] + 0.7, { size: 13 });
  },
  controls: () => [
    { title: 'Move the points' },
    { key: 'bars', label: 'Show x and y halves separately', toggle: true },
    { text: 'Drag A and B, or focus one and use the arrow keys. Enter switches point.' },
    { readout: [
      ['Halfway in x', (s) => `(${s.x1} + ${s.x2}) ÷ 2 = ${fixed(midpoint(A(s), B(s))[0], 1)}`],
      ['Halfway in y', (s) => `(${s.y1} + ${s.y2}) ÷ 2 = ${fixed(midpoint(A(s), B(s))[1], 1)}`],
      ['Midpoint M', (s) => `(${fixed(midpoint(A(s), B(s))[0], 1)}, ${fixed(midpoint(A(s), B(s))[1], 1)})`],
    ] },
  ],
  tex: (s) => `M=\\left(\\dfrac{${s.x1}+${s.x2 < 0 ? `(${s.x2})` : s.x2}}{2},\\dfrac{${s.y1}+${s.y2 < 0 ? `(${s.y2})` : s.y2}}{2}\\right)=(${fixed(midpoint(A(s), B(s))[0], 1)},\\ ${fixed(midpoint(A(s), B(s))[1], 1)})`,
});

const snap = (v) => Math.max(-R + 1, Math.min(R - 1, Math.round(v)));
const grab = (xKey, yKey) => ({
  at: () => tool.extra.toPx(state[xKey], state[yKey]),
  move(px, py) {
    const [x, y] = tool.extra.toWorld(px, py);
    state[xKey] = snap(x);
    state[yKey] = snap(y);
  },
  get keyStep() { return Math.abs(tool.extra.toPx(1, 0)[0] - tool.extra.toPx(0, 0)[0]); },
});
handles(tool.stage, [grab('x1', 'y1'), grab('x2', 'y2')], { onChange: () => tool.update(), radius: 28 });
tool.update();
