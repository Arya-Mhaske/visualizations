import { createTool } from '../../lib/tool.js';
import { arrow, line, label, dot } from '../../lib/draw.js';
import { coulombField, swirlField, segmentWork } from './_potential.js';

// A test charge goes round a four-sided loop in the field of a charge at the origin (k Q q = 1). Work is summed over each side.
const state = { field: 'coulomb', r1: 1.5, r2: 3, phi: 60 };
const corners = (s) => {
  const p = (s.phi * Math.PI) / 180;
  return [[s.r1, 0], [s.r2, 0], [s.r2 * Math.cos(p), s.r2 * Math.sin(p)], [s.r1 * Math.cos(p), s.r1 * Math.sin(p)]];
};
const F = (s) => (s.field === 'coulomb' ? coulombField : swirlField);
const works = (s) => { const cs = corners(s); return cs.map((a, i) => segmentWork(F(s), a, cs[(i + 1) % 4])); };
const total = (s) => works(s).reduce((p, w) => p + w, 0);

createTool({
  state,
  label: 'A four-sided loop around a charge at the origin. Arrows show the force on a test charge. The work done on each side is listed. For the Coulomb force the four works add up to zero for any loop. For a swirling force they do not, so no potential could exist.',
  draw(ctx, stage, c) {
    const [W, H] = [stage.w, stage.h];
    const s = Math.min(W, H) / 8.5;
    const [ox, oy] = [W * 0.3, H * 0.62];
    const px = ([x, y]) => [ox + x * s, oy - y * s];
    const f = F(state);
    for (let x = -1; x <= 6; x += 1) for (let y = -3; y <= 5; y += 1) {
      if (Math.hypot(x, y) < 0.8) continue;
      const [fx, fy] = f([x, y]);
      const m = Math.hypot(fx, fy);
      const L = Math.min(18, 7 + 30 * m);
      const [qx, qy] = px([x, y]);
      arrow(ctx, qx, qy, qx + (fx / m) * L, qy - (fy / m) * L, { color: c.grid, width: 1.5, head: 6 });
    }
    const cs = corners(state).map(px);
    ctx.beginPath();
    cs.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.closePath();
    ctx.fillStyle = c.fillY;
    ctx.globalAlpha = 0.6;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 4;
    ctx.stroke();
    cs.forEach(([x, y], i) => label(ctx, 'ABCD'[i], x + (i === 0 || i === 1 ? 0 : -12), y + (i < 2 ? 14 : -12), c, { size: 12, bounds: stage, patch: false }));
    dot(ctx, ox, oy, 9, c.a, c.ink);
    const w = works(state);
    ['AB', 'BC', 'CD', 'DA'].forEach((n, i) => label(ctx, `${n}: ${w[i].toFixed(3)}`, W * 0.82, H * (0.12 + i * 0.06), c, { size: 11, align: 'center', bounds: stage, patch: false }));
    label(ctx, `total: ${total(state).toFixed(3)}`, W * 0.82, H * 0.38, c, { size: 13, bounds: stage, patch: false });
    line(ctx, W * 0.7, H * 0.33, W * 0.94, H * 0.33, { color: c.ink, width: 2 });
  },
  controls: [
    { title: 'Carry a charge round a loop' },
    { key: 'field', label: 'Force', options: [['coulomb', 'Coulomb'], ['swirl', 'A swirling force']] },
    { key: 'r1', label: 'Inner radius', min: 1, max: 2.5, step: 0.5, format: (v) => v.toFixed(1) },
    { key: 'r2', label: 'Outer radius', min: 3, max: 5, step: 0.5, format: (v) => v.toFixed(1) },
    { key: 'phi', label: 'Opening angle', min: 30, max: 150, step: 15, format: (v) => `${v}°` },
    { readout: [
      ['Work round loop', (s) => ({ text: Math.abs(total(s)) < 1e-6 ? '0' : total(s).toFixed(3), good: Math.abs(total(s)) < 1e-6 })],
    ] },
  ],
  tex: (s) => `\\oint \\vec F\\cdot d\\vec l=${works(s).map((w) => w.toFixed(3)).join('+')}=${total(s).toFixed(3)}`,
});
