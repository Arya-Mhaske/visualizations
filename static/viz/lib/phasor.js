// Rotating vectors for SHM and AC. A phasor at angle θ, measured anticlockwise from +x, has shadow R cos θ on the
// horizontal axis (SHM) and R sin θ on the vertical axis (AC: NCERT reads v = v_m sin ωt from the vertical axis).
//   phasor(ctx, cx, cy, R, theta, { color, c, circle, shadowY, shadowX })  draws the circle, arrow and drop to the shadow.
//     shadowY: the screen y of a horizontal axis, so the tip drops straight down to it.
//     shadowX: the screen x of a vertical axis, so the tip runs straight across to it. Returns the tip.
//   project(R, theta) -> R cos θ, the value the arrow casts on the horizontal axis
//   height(R, theta)  -> R sin θ, the value the arrow casts on the vertical axis
//   addPhasors(list)  -> { size, angle } of the tip-to-tail sum of [{ size, angle }, ...]; size 0 has angle 0
//   wave(ctx, x0, cy, width, value, { color, turns, dash, lineWidth })  a trace flowing away from x = x0: the point s of
//     the way along shows value(−2π·turns·s), so the newest value sits at x0, level with the arrow that made it.
import { arc, arrow, dot, line, TAU } from './draw.js';

export const project = (R, theta) => R * Math.cos(theta);
export const height = (R, theta) => R * Math.sin(theta);

export function addPhasors(list) {
  const x = list.reduce((sum, p) => sum + project(p.size, p.angle), 0);
  const y = list.reduce((sum, p) => sum + height(p.size, p.angle), 0);
  const size = Math.hypot(x, y);
  return size < 1e-9 ? { size: 0, angle: 0 } : { size, angle: Math.atan2(y, x) };
}

export function phasor(ctx, cx, cy, R, theta, { color, c, circle = true, shadowY = null, shadowX = null }) {
  const tip = [cx + R * Math.cos(theta), cy - R * Math.sin(theta)];
  if (circle) arc(ctx, cx, cy, R, 0, TAU, { color: c.grid, width: 2 });
  arrow(ctx, cx, cy, ...tip, { color, width: 4 });
  if (shadowY !== null) {
    line(ctx, tip[0], tip[1], tip[0], shadowY, { color, width: 1, dash: [4, 4] });
    dot(ctx, tip[0], shadowY, 7, color, c.ink, 2);
  }
  if (shadowX !== null) {
    line(ctx, tip[0], tip[1], shadowX, tip[1], { color, width: 1, dash: [4, 4] });
    dot(ctx, shadowX, tip[1], 7, color, c.ink, 2);
  }
  return tip;
}

export function wave(ctx, x0, cy, width, value, { color, turns = 2, dash = [], lineWidth = 3 }) {
  const steps = Math.max(60, Math.round(width / 2));
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineJoin = 'round';
  ctx.setLineDash(dash);
  ctx.beginPath();
  for (let i = 0; i <= steps; i++) {
    const s = i / steps;
    const y = cy - value(-TAU * turns * s);
    if (i) ctx.lineTo(x0 + width * s, y);
    else ctx.moveTo(x0, y);
  }
  ctx.stroke();
  ctx.restore();
}
