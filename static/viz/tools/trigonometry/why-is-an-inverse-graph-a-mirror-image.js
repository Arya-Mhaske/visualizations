import { createTool } from '../../lib/tool.js';
import { arrow, dot, label, line } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { eqFrame, drawGrid, rad } from './_kit.js';

const CURVES = {
  sin: { f: Math.sin, lo: -Math.PI / 2, hi: Math.PI / 2, inv: 'sin⁻¹' },
  cos: { f: Math.cos, lo: 0, hi: Math.PI, inv: 'cos⁻¹' },
  tan: { f: Math.tan, lo: -1.27, hi: 1.27, inv: 'tan⁻¹' },
};
const state = { fn: 'sin', fold: 0, u: 0.5 };
const cur = () => CURVES[state.fn];
const at = () => cur().lo + (cur().hi - cur().lo) * state.u;
const s = () => (1 - Math.cos(rad(state.fold))) / 2;
const move = ([x, y]) => [x + s() * (y - x), y + s() * (x - y)];

createTool({
  state,
  label: 'A restricted trigonometric graph in grey, the line y = x, and the same graph in coral being folded over that line. When the fold is complete, the coral curve is the inverse function, and a marked point has swapped its x and y.',
  draw(ctx, stage, c) {
    const f = eqFrame(stage, [-3.4, 3.4], [-3.4, 3.4]);
    drawGrid(ctx, f, c, stage, { step: 1 });
    line(ctx, ...f.px([-3.4, -3.4]), ...f.px([3.4, 3.4]), { color: c.d, width: 3, dash: [8, 5] });
    const { f: fn, lo, hi } = cur();
    const pts = [];
    for (let i = 0; i <= 160; i++) { const x = lo + ((hi - lo) * i) / 160; pts.push([x, fn(x)]); }
    const draw = (list, color, width) => {
      ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineJoin = 'round'; ctx.beginPath();
      list.forEach((p, i) => (i ? ctx.lineTo(...f.px(p)) : ctx.moveTo(...f.px(p))));
      ctx.stroke(); ctx.restore();
    };
    draw(pts, c.grid, 4);
    draw(pts.map(move), c.a, 5);
    const p = [at(), fn(at())];
    dot(ctx, ...f.px(p), 6, c.grid, c.ink, 2);
    dot(ctx, ...f.px(move(p)), 8, c.a, c.ink);
    if (state.fold > 0) arrow(ctx, ...f.px(p), ...f.px(move(p)), { color: c.b, width: 2, head: 8 });
    label(ctx, state.fold >= 179 ? `${cur().inv} x` : `${state.fn} x`, ...f.px(move(pts[Math.floor(pts.length * 0.8)])), c, { size: 11, color: c.a, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Fold over y = x' },
    { key: 'fn', label: 'Function', options: [['sin', 'sin'], ['cos', 'cos'], ['tan', 'tan']] },
    { key: 'fold', label: 'Fold', min: 0, max: 180, step: 5, format: (n) => `${n}°` },
    { key: 'u', label: 'Point on the curve', min: 0.02, max: 0.98, step: 0.02, format: (n) => fixed(n, 2) },
    { readout: [
      ['Point on f', () => `(${fixed(at(), 2)}, ${fixed(cur().f(at()), 2)})`],
      ['After the fold', () => `(${fixed(cur().f(at()), 2)}, ${fixed(at(), 2)})`],
    ] },
  ],
  tex: () => `(a,\\,b)\\ \\longmapsto\\ (b,\\,a)`,
});
