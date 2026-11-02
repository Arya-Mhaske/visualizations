import { createTool } from '../../lib/tool.js';
import { arrow, dot, label, line } from '../../lib/draw.js';
import { forceUcCm } from './_coulomb.js';

// Test charge +1 µC at (x, y) cm. Sources A at (−3, 0) and B at (3, 0), in µC. Force in newtons.
const state = { qa: 2, qb: -2, x: 0.5, y: 3.5 };
const SRC = [[-3, 0], [3, 0]];
function parts(s) {
  return SRC.map(([sx, sy], i) => {
    const q = i ? s.qb : s.qa;
    const [dx, dy] = [s.x - sx, s.y - sy];
    const r = Math.hypot(dx, dy);
    const f = forceUcCm(q, 1, r);
    return [(f * dx) / r, (f * dy) / r, r, f];
  });
}
const net = (s) => parts(s).reduce(([a, b], [x, y]) => [a + x, b + y], [0, 0]);

createTool({
  state,
  label: 'Two source charges on the horizontal axis and a test charge that you place. The force from each source is drawn, and each is split into x and y components. The sums of the components give the net force.',
  draw(ctx, stage, c) {
    const [W, H] = [stage.w, stage.h];
    const s = Math.min(W, H) / 13;
    const [ox, oy] = [W / 2, H / 2];
    const px = (x, y) => [ox + x * s, oy - y * s];
    const k = (Math.min(W, H) * 0.25) / 40;
    line(ctx, 0, oy, W, oy, { color: c.grid, width: 1 });
    line(ctx, ox, 0, ox, H, { color: c.grid, width: 1 });
    SRC.forEach(([sx, sy], i) => {
      const [x, y] = px(sx, sy);
      const q = i ? state.qb : state.qa;
      dot(ctx, x, y, 12, q >= 0 ? c.a : c.b, c.ink);
      label(ctx, `${i ? 'B' : 'A'} ${q > 0 ? '+' : ''}${q}`, x, y + 24, c, { size: 11, bounds: stage, patch: false });
    });
    const [tx, ty] = px(state.x, state.y);
    parts(state).forEach(([fx, fy], i) => arrow(ctx, tx, ty, tx + fx * k, ty - fy * k, { color: i ? c.b : c.a, width: 3, head: 9 }));
    const [nx, ny] = net(state);
    line(ctx, tx, ty, tx + nx * k, ty, { color: c.ink, width: 2, dash: [4, 4] });
    line(ctx, tx + nx * k, ty, tx + nx * k, ty - ny * k, { color: c.ink, width: 2, dash: [4, 4] });
    arrow(ctx, tx, ty, tx + nx * k, ty - ny * k, { color: c.ink, width: 4, head: 11 });
    dot(ctx, tx, ty, 8, c.c, c.ink);
  },
  controls: [
    { title: 'Place the test charge' },
    { key: 'x', label: 'x (cm)', min: -4.5, max: 4.5, step: 1 },
    { key: 'y', label: 'y (cm)', min: -4.5, max: 4.5, step: 1 },
    { key: 'qa', label: 'Charge A (µC)', min: -4, max: 4, step: 1 },
    { key: 'qb', label: 'Charge B (µC)', min: -4, max: 4, step: 1 },
    { readout: [
      ['Fx = F₁ₓ + F₂ₓ', (s) => `${net(s)[0].toFixed(1)} N`],
      ['Fy = F₁ᵧ + F₂ᵧ', (s) => `${net(s)[1].toFixed(1)} N`],
      ['|F|', (s) => `${Math.hypot(...net(s)).toFixed(1)} N`],
      ['Direction', (s) => `${((Math.atan2(net(s)[1], net(s)[0]) * 180) / Math.PI).toFixed(0)}°`],
    ] },
  ],
  tex: (s) => `F=\\sqrt{F_x^{2}+F_y^{2}}=\\sqrt{${net(s)[0].toFixed(1)}^{2}+${net(s)[1].toFixed(1)}^{2}}=${Math.hypot(...net(s)).toFixed(1)}\\ \\mathrm{N}`,
});
