import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { arrow, label, line } from '../../lib/draw.js';
import { drawLevel, levelList } from './_mv.js';
import { contour } from '../vectors-3d/_quadric-surfaces-math.js';

// Walk along the constraint curve g = k. Slide the contour of f along with you. Where the contour just touches the curve (kisses it),
// f has stopped rising or falling along the curve, so ∇f points the same way as ∇g: ∇f = λ∇g.
export const PRESETS = {
  a: { name: 'max xy on x² + y² = 8', f: (x, y) => x * y, gf: (x, y) => [y, x], g: (x, y) => x * x + y * y - 8, gg: (x, y) => [2 * x, 2 * y], P: (t) => [Math.sqrt(8) * Math.cos(t), Math.sqrt(8) * Math.sin(t)], t0: 0, t1: 2 * Math.PI },
  b: { name: 'extremes of x + 2y on x² + y² = 5', f: (x, y) => x + 2 * y, gf: () => [1, 2], g: (x, y) => x * x + y * y - 5, gg: (x, y) => [2 * x, 2 * y], P: (t) => [Math.sqrt(5) * Math.cos(t), Math.sqrt(5) * Math.sin(t)], t0: 0, t1: 2 * Math.PI },
  c: { name: 'min x² + y² on x + y = 4', f: (x, y) => x * x + y * y, gf: (x, y) => [2 * x, 2 * y], g: (x, y) => x + y - 4, gg: () => [1, 1], P: (t) => [t, 4 - t], t0: -1, t1: 5 },
};
const state = { which: 'a', u: 0.1 };
const Q = () => PRESETS[state.which];
const tOf = (u) => Q().t0 + (Q().t1 - Q().t0) * u;
export function stats(which, u) {
  const C = PRESETS[which];
  const t = C.t0 + (C.t1 - C.t0) * u;
  const [x, y] = C.P(t);
  const gf = C.gf(x, y);
  const gg = C.gg(x, y);
  const cross = gf[0] * gg[1] - gf[1] * gg[0];
  return { x, y, gf, gg, cross, lambda: Math.abs(gg[0]) > 1e-9 ? gf[0] / gg[0] : gf[1] / gg[1], value: C.f(x, y) };
}

createTool({
  state,
  label: 'A contour map of f with a constraint curve in blue. A point slides along the curve; the contour of f through it is in black. The gradients of f (coral) and of the constraint (blue) are drawn at the point. They line up exactly where the contour touches the curve without crossing it. A small chart below plots f along the curve.',
  setup: (stage, c) => createPlot(stage, { x: [-4.2, 4.2], y: [-5.6, 4.2], c }),
  draw(ctx, stage, c, plot) {
    const C = Q();
    plot.axes();
    levelList(C.f, 4, 10).forEach((l) => drawLevel(ctx, plot, C.f, l, 4, { color: c.grid, width: 1 }));
    for (const [p, q] of contour(C.g, -4, 4, 90)) line(ctx, ...plot.toPx(...p), ...plot.toPx(...q), { color: c.b, width: 4 });
    const s = stats(state.which, state.u);
    drawLevel(ctx, plot, C.f, s.value, 4, { color: c.ink, width: 3 });
    const [px, py] = plot.toPx(s.x, s.y);
    const unit = (v) => { const l = Math.hypot(...v) || 1; return [v[0] / l, v[1] / l]; };
    const [uf, ug] = [unit(s.gf), unit(s.gg)];
    arrow(ctx, px, py, ...plot.toPx(s.x + uf[0] * 1.1, s.y + uf[1] * 1.1), { color: c.a, width: 4 });
    arrow(ctx, px, py, ...plot.toPx(s.x + ug[0] * 0.8, s.y + ug[1] * 0.8), { color: c.b, width: 3 });
    plot.point(s.x, s.y);
    // chart: f along the curve
    const [bx, by, bw, bh] = [10, stage.h * 0.76, stage.w - 20, stage.h * 0.2];
    ctx.fillStyle = c.paper;
    ctx.fillRect(bx, by, bw, bh);
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 2;
    ctx.strokeRect(bx, by, bw, bh);
    const vals = [...Array(61).keys()].map((k) => stats(state.which, k / 60).value);
    const [lo, hi] = [Math.min(...vals), Math.max(...vals)];
    const X = (u) => bx + u * bw;
    const Y = (v) => by + bh - 6 - ((v - lo) / (hi - lo || 1)) * (bh - 12);
    ctx.beginPath();
    vals.forEach((v, k) => (k ? ctx.lineTo(X(k / 60), Y(v)) : ctx.moveTo(X(0), Y(v))));
    ctx.stroke();
    ctx.fillStyle = c.a;
    ctx.fillRect(X(state.u) - 4, Y(s.value) - 4, 8, 8);
    label(ctx, 'f along the curve', bx + bw / 2, by + 10, c, { size: 10, bounds: stage });
  },
  controls: [
    { title: 'Slide along the constraint' },
    { key: 'which', label: 'Problem', options: Object.entries(PRESETS).map(([k, v]) => [k, v.name]) },
    { key: 'u', label: 'Position along the curve', min: 0, max: 1, step: 0.005, format: (v) => `${(v * 100).toFixed(1)}%` },
    { readout: [
      ['f at the point', (s) => stats(s.which, s.u).value.toFixed(3)],
      ['∇f × ∇g', (s) => stats(s.which, s.u).cross.toFixed(3)],
      ['Parallel?', (s) => { const st = stats(s.which, s.u); const ok = Math.abs(st.cross) / ((Math.hypot(...st.gf) * Math.hypot(...st.gg)) || 1) < 0.02; return { text: ok ? 'yes: a candidate (λ = ' + stats(s.which, s.u).lambda.toFixed(2) + ')' : 'no: f still changes along the curve', good: ok }; }],
    ] },
  ],
  tex: () => '\\nabla f=\\lambda\\nabla g,\\quad g(x,y)=k',
});
void tOf;
