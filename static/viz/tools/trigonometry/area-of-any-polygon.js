import { createTool } from '../../lib/tool.js';
import { handles } from '../../lib/stage.js';
import { dot, label, poly } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { fan, shoelace } from './_triangle-math.js';
import { drawGrid, eqFrame, pointHandle } from './_kit.js';

const state = { n: 5, pts: [[1, 1], [7, 1], [9, 4], [5, 7], [1, 5], [0, 3]] };
let f = null;
const clamp = ([x, y]) => [Math.max(0, Math.min(10, Math.round(x * 2) / 2)), Math.max(0, Math.min(8, Math.round(y * 2) / 2))];
const pts = () => state.pts.slice(0, state.n);
const FILLS = ['fillA', 'fillB', 'fillC', 'fillY'];

const tool = createTool({
  state,
  label: 'A polygon on a grid whose corners you can drag. Lines from the first corner split it into triangles, each shaded differently and labelled with its area. The triangle areas add up to the area of the whole polygon.',
  draw(ctx, stage, c) {
    f = eqFrame(stage, [-0.7, 10.7], [-0.7, 8.7], 8);
    drawGrid(ctx, f, c, stage, { step: 1, labels: false });
    const P = pts().map(f.px);
    const parts = fan(pts());
    parts.forEach((area, i) => {
      const tri = [P[0], P[i + 1], P[i + 2]];
      poly(ctx, tri, { fill: c[FILLS[i % 4]], stroke: c.ink, width: 2 });
      const mid = [(tri[0][0] + tri[1][0] + tri[2][0]) / 3, (tri[0][1] + tri[1][1] + tri[2][1]) / 3];
      label(ctx, fixed(area, 1), ...mid, c, { size: 11, bounds: stage, patch: false });
    });
    poly(ctx, P, { stroke: c.ink, width: 4 });
    P.forEach((p, i) => {
      dot(ctx, ...p, 8, i === 0 ? c.a : c.b, c.ink);
      label(ctx, String.fromCharCode(65 + i), p[0], p[1] + 17, c, { size: 12, bounds: stage, patch: false });
    });
  },
  controls: [
    { title: 'Drag the corners' },
    { key: 'n', label: 'Number of corners', min: 3, max: 6, step: 1 },
    { readout: [
      ['Triangles', () => String(state.n - 2)],
      ['Sum of triangle areas', () => fixed(Math.abs(fan(pts()).reduce((s, v) => s + v, 0)), 2)],
      ['Area of the polygon', () => fixed(shoelace(pts()), 2)],
    ] },
  ],
  tex: () => `\\text{Area}=${fan(pts()).map((v) => fixed(v, 1)).join('+')}=${fixed(Math.abs(fan(pts()).reduce((s, v) => s + v, 0)), 2)}`,
});

handles(tool.stage, state.pts.map((_, i) => {
  const h = pointHandle(() => f, () => state.pts[i], (p) => { state.pts[i] = clamp(p); }, { limit: clamp, unit: 0.5 });
  return { at: () => (i < state.n ? h.at() : [-999, -999]), move: h.move, get keyStep() { return h.keyStep; } };
}), { onChange: () => tool.update(), radius: 30 });
