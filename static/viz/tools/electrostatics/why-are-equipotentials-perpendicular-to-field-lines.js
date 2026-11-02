import { createTool } from '../../lib/tool.js';
import { arrow, dot, label } from '../../lib/draw.js';
import { fieldAt, potentialAt, traceLine } from '../../lib/field.js';

// Two charges: +1 at (−2, 0) and ±1 at (2, 0). A test point P and a short step at angle α to the field.
const state = { sign2: -1, px: 0, py: 1.5, alpha: 45 };
const charges = (s) => [{ x: -2, y: 0, q: 1 }, { x: 2, y: 0, q: s.sign2 }];
const field = (s) => fieldAt(charges(s), [s.px, s.py]);
// work per unit charge for a step of length 0.5 at angle α measured from E
const dW = (s) => { const [ex, ey] = field(s); return Math.hypot(ex, ey) * 0.5 * Math.cos((s.alpha * Math.PI) / 180); };
function equip(s) {
  const ch = charges(s);
  const V0 = potentialAt(ch, [s.px, s.py]);
  const walk = (dir) => {
    let [x, y] = [s.px, s.py];
    const out = [[x, y]];
    for (let i = 0; i < 400; i++) {
      const [ex, ey] = fieldAt(ch, [x, y]);
      const m = Math.hypot(ex, ey);
      if (!m || Math.abs(x) > 8 || Math.abs(y) > 6) break;
      x += (dir * -ey) / m * 0.03; y += (dir * ex) / m * 0.03;
      const [fx, fy] = fieldAt(ch, [x, y]); // pull back onto V0
      const f2 = fx * fx + fy * fy;
      const dv = potentialAt(ch, [x, y]) - V0;
      x += (dv * fx) / f2; y += (dv * fy) / f2;
      out.push([x, y]);
      if (Math.hypot(x - ch[0].x, y) < 0.2 || Math.hypot(x - ch[1].x, y) < 0.2) break;
    }
    return out;
  };
  return [walk(1), walk(-1)];
}

createTool({
  state,
  label: 'Two charges with the field line and the equipotential curve through a chosen point. The two curves cross at a right angle. A short step is drawn at an angle to the field, and the work done on a unit charge for that step is shown. It is zero only when the step is at ninety degrees to the field, along the equipotential.',
  draw(ctx, stage, c) {
    const [W, H] = [stage.w, stage.h];
    const s = Math.min(W / 16, H / 12);
    const [ox, oy] = [W / 2, H / 2];
    const px = ([x, y]) => [ox + x * s, oy - y * s];
    const ch = charges(state);
    const path = (pts, color, width, dash) => { ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(...px(p)) : ctx.moveTo(...px(p)))); ctx.strokeStyle = color; ctx.lineWidth = width; ctx.setLineDash(dash); ctx.stroke(); ctx.setLineDash([]); };
    equip(state).forEach((pts) => path(pts, c.b, 3, []));
    for (const sign of [1, -1]) {
      const t = traceLine(ch, [state.px, state.py], { sign, step: 0.05, steps: 600, bounds: { left: -8, right: 8, top: 6, bottom: -6 } });
      path(t.points, c.a, 3, [6, 4]);
    }
    ch.forEach((q) => { dot(ctx, ...px([q.x, q.y]), 11, q.q > 0 ? c.a : c.b, c.ink); label(ctx, q.q > 0 ? '+' : '−', ...px([q.x, q.y]), c, { size: 12, patch: false }); });
    const [ex, ey] = field(state);
    const m = Math.hypot(ex, ey);
    const a = (state.alpha * Math.PI) / 180;
    const [ux, uy] = [ex / m, ey / m];
    const [dx, dy] = [ux * Math.cos(a) - uy * Math.sin(a), ux * Math.sin(a) + uy * Math.cos(a)];
    const [qx, qy] = px([state.px, state.py]);
    arrow(ctx, qx, qy, qx + ux * 50, qy - uy * 50, { color: c.a, width: 3, head: 9 });
    arrow(ctx, qx, qy, qx + dx * 50, qy - dy * 50, { color: c.ink, width: 3, head: 9 });
    dot(ctx, qx, qy, 6, c.c, c.ink, 2);
    label(ctx, 'E', qx + ux * 62, qy - uy * 62, c, { size: 11, color: c.a, bounds: stage, patch: false });
    label(ctx, 'step', qx + dx * 62, qy - dy * 62, c, { size: 11, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Move along or across' },
    { key: 'alpha', label: 'Step direction, angle from E', min: 0, max: 180, step: 15, format: (v) => `${v}°` },
    { key: 'px', label: 'Point x', min: -6, max: 6, step: 0.5, format: (v) => v.toFixed(1) },
    { key: 'py', label: 'Point y', min: -4, max: 4, step: 0.5, format: (v) => v.toFixed(1) },
    { key: 'sign2', label: 'Right-hand charge', options: [[-1, '−'], [1, '+']] },
    { readout: [
      ['Work for the step', (s) => ({ text: Math.abs(dW(s)) < 1e-6 ? '0' : dW(s).toFixed(3), good: Math.abs(dW(s)) < 1e-6 })],
      ['|E| here', (s) => Math.hypot(...field(s)).toFixed(3)],
    ] },
  ],
  tex: (s) => `dW=\\vec E\\cdot d\\vec l=E\\,dl\\cos\\alpha=${dW(s).toFixed(3)}`,
});
