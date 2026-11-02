// Small canvas pieces reused across the modern-physics tools.
import { line, label } from '../../lib/draw.js';

// A flat bar with an ink outline, from the bottom edge up. rect = {x, y, w, h}; v and max in the same unit.
export function bar(ctx, c, rect, v, max, fill) {
  const h = (rect.h * Math.max(0, v)) / max;
  ctx.fillStyle = fill;
  ctx.fillRect(rect.x, rect.y + rect.h - h, rect.w, h);
  ctx.strokeStyle = c.ink;
  ctx.lineWidth = 3;
  ctx.strokeRect(rect.x, rect.y + rect.h - h, rect.w, h);
}

// A framed vertical energy scale, 0 at the bottom; returns y(e) for drawing across it.
export function energyScale(ctx, c, rect, max, unit = 'eV') {
  ctx.strokeStyle = c.ink;
  ctx.lineWidth = 3;
  ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
  const y = (e) => rect.y + rect.h - (rect.h * e) / max;
  for (let e = 0; e <= max; e += 1) {
    if (e > 0) line(ctx, rect.x, y(e), rect.x + rect.w, y(e), { color: c.grid, width: 1 });
    label(ctx, `${e}`, rect.x - 10, y(e), c, { size: 10, patch: false, align: 'right' });
  }
  label(ctx, unit, rect.x - 4, rect.y - 10, c, { size: 10, patch: false, align: 'right' });
  return y;
}

// A pointer from (x, y) to the stage edge guard: keeps a point inside the stage.
export const inside = (stage, x, y, m = 8) => [
  Math.min(stage.w - m, Math.max(m, x)),
  Math.min(stage.h - m, Math.max(m, y)),
];
