// Small helpers for the electric-charge box. Positive is coral (c.a), negative is blue (c.b).
import { dot, label } from '../../lib/draw.js';
export const E = 1.6e-19;
export function mark(ctx, x, y, sign, c, r = 7) {
  dot(ctx, x, y, r, sign > 0 ? c.a : c.b, c.ink, 1.5);
  label(ctx, sign > 0 ? '+' : '−', x, y, c, { size: Math.max(9, r + 2), patch: false });
}
