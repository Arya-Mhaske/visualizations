import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { handles } from '../../lib/stage.js';
import { dot, poly } from '../../lib/draw.js';
import { fixed, sig } from '../../lib/format.js';
import { distance, squareOn, squares } from './_coordinate-plane-math.js';

const R = 8;
const state = { x1: -3, y1: -2, x2: 3, y2: 2, show: true };
const A = (s = state) => [s.x1, s.y1];
const B = (s = state) => [s.x2, s.y2];

const tool = createTool({
  state,
  label: 'A coordinate plane with two draggable points A and B. A horizontal leg and a vertical leg join them in a right triangle. A coral square is drawn on the horizontal leg, a blue square on the vertical leg, and a green square on the hypotenuse AB. The two small squares together have the same area as the big one.',
  setup: (stage, c) => createPlot(stage, { x: [-R, R], y: [-R, R], c, pad: 18 }),
  draw(ctx, stage, c, plot) {
    plot.axes();
    const [a, b] = [A(), B()];
    const px = (p) => plot.toPx(p[0], p[1]);
    const corner = [b[0], a[1]];
    if (state.show) {
      ctx.globalAlpha = 0.55;
      poly(ctx, squareOn(a, corner, b).map(px), { fill: c.a, stroke: c.ink, width: 2 });
      poly(ctx, squareOn(corner, b, a).map(px), { fill: c.b, stroke: c.ink, width: 2 });
      poly(ctx, squareOn(a, b, corner).map(px), { fill: c.c, stroke: c.ink, width: 2 });
      ctx.globalAlpha = 1;
    }
    plot.segment(a[0], a[1], corner[0], corner[1], { color: c.a, width: 4 });
    plot.segment(corner[0], corner[1], b[0], b[1], { color: c.b, width: 4 });
    plot.segment(a[0], a[1], b[0], b[1], { color: c.ink, width: 4 });
    plot.text(`Δx = ${fixed(Math.abs(b[0] - a[0]), 0)}`, (a[0] + b[0]) / 2, a[1] + (b[1] > a[1] ? -0.7 : 0.7), { size: 11 });
    plot.text(`Δy = ${fixed(Math.abs(b[1] - a[1]), 0)}`, b[0] + (b[0] > a[0] ? 1.2 : -1.2), (a[1] + b[1]) / 2, { size: 11 });
    dot(ctx, ...px(a), 9, c.fillY, c.ink);
    dot(ctx, ...px(b), 9, c.fillY, c.ink);
    plot.text('A', a[0] - 0.6, a[1] + 0.6, { size: 13 });
    plot.text('B', b[0] + 0.6, b[1] + 0.6, { size: 13 });
  },
  controls: () => [
    { title: 'Move the points' },
    { key: 'show', label: 'Show the squares', toggle: true },
    { text: 'Drag A and B, or focus one and use the arrow keys. Enter switches point.' },
    { readout: [
      ['Δx², the coral square', (s) => String(squares(A(s), B(s)).dx2)],
      ['Δy², the blue square', (s) => String(squares(A(s), B(s)).dy2)],
      ['AB², the green square', (s) => String(squares(A(s), B(s)).d2)],
      ['AB', (s) => sig(distance(A(s), B(s)), 4)],
    ] },
  ],
  tex: (s) => `d=\\sqrt{(${s.x2}-${s.x1 < 0 ? `(${s.x1})` : s.x1})^2+(${s.y2}-${s.y1 < 0 ? `(${s.y1})` : s.y1})^2}=\\sqrt{${squares(A(s), B(s)).d2}}=${sig(distance(A(s), B(s)), 4)}`,
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
