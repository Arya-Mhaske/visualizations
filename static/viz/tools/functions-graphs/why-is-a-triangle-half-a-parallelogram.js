import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { handles } from '../../lib/stage.js';
import { poly } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { grab } from './_fx.js';

const state = { ax: 1, ay: 5, bx: -4, by: -2, cx: 5, cy: -2, turn: 180 };
const R = 8;
const area = (p, q, r) => Math.abs((q[0] - p[0]) * (r[1] - p[1]) - (r[0] - p[0]) * (q[1] - p[1])) / 2;
const P = (s = state) => [[s.ax, s.ay], [s.bx, s.by], [s.cx, s.cy]];
const mid = (s = state) => [(s.bx + s.cx) / 2, (s.by + s.cy) / 2];
const rot = (p, o, deg) => { const t = (deg * Math.PI) / 180; const [dx, dy] = [p[0] - o[0], p[1] - o[1]]; return [o[0] + dx * Math.cos(t) - dy * Math.sin(t), o[1] + dx * Math.sin(t) + dy * Math.cos(t)]; };

const tool = createTool({
  state,
  label: 'A triangle with three corners that you can drag. A copy of the triangle is turned about the middle of its side BC. When the copy has turned half a revolution, 180 degrees, the two triangles fit together exactly into a parallelogram. So the parallelogram has twice the area of the triangle, and the triangle is half of base times height.',
  setup: (stage, c) => createPlot(stage, { x: [-R, R], y: [-R, R], c, pad: 14 }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: '', yLabel: '', grid: false });
    const [A, B, C] = P();
    const M = mid();
    const copy = [A, B, C].map((p) => rot(p, M, state.turn));
    poly(ctx, copy.map((p) => plot.toPx(...p)), { fill: c.fillA, stroke: c.ink, width: 3 });
    poly(ctx, [A, B, C].map((p) => plot.toPx(...p)), { fill: c.fillB, stroke: c.ink, width: 3 });
    plot.point(M[0], M[1], { fill: c.fillY, r: 6 });
    [['A', A], ['B', B], ['C', C]].forEach(([n, p]) => { plot.point(p[0], p[1], { fill: c.paper, r: 8 }); plot.text(n, p[0] + 0.5, p[1] + 0.7, { size: 12, patch: false }); });
  },
  controls: [
    { title: 'Copy and turn' },
    { key: 'turn', label: 'Turn the copy about the middle of BC', min: 0, max: 180, step: 5, format: (v) => `${v}°` },
    { text: 'Drag A, B or C, or use the arrow keys.' },
    { readout: [
      ['Triangle area', (s) => fixed(area(...P(s)), 2)],
      ['Parallelogram area', (s) => (s.turn === 180 ? fixed(2 * area(...P(s)), 2) : 'turn the copy to 180°')],
      ['Base BC, and height from A', (s) => { const b = Math.hypot(s.cx - s.bx, s.cy - s.by); return b ? `${fixed(b, 2)}, ${fixed((2 * area(...P(s))) / b, 2)}` : '—'; }],
    ] },
  ],
  tex: (s) => `\\text{parallelogram}=bh\\ \\Rightarrow\\ \\text{triangle}=\\tfrac12 bh=${fixed(area(...P(s)), 2)}`,
});

handles(tool.stage, [grab(tool, state, 'ax', 'ay'), grab(tool, state, 'bx', 'by'), grab(tool, state, 'cx', 'cy')], { onChange: () => tool.update(), radius: 26 });
tool.update();
