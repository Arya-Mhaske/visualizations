// Rotating vectors for SHM and AC. A phasor at angle θ, measured anticlockwise from +x, has shadow R cos θ.
//   phasor(ctx, cx, cy, R, theta, { color, c, circle, shadowY })  draws the circle, arrow and drop to the shadow
//   project(R, theta) -> R cos θ, the value the arrow casts on the horizontal axis
import { arc, arrow, dot, line, TAU } from './draw.js';

export const project = (R, theta) => R * Math.cos(theta);

export function phasor(ctx, cx, cy, R, theta, { color, c, circle = true, shadowY = null }) {
  const tip = [cx + R * Math.cos(theta), cy - R * Math.sin(theta)];
  if (circle) arc(ctx, cx, cy, R, 0, TAU, { color: c.grid, width: 2 });
  arrow(ctx, cx, cy, ...tip, { color, width: 4 });
  if (shadowY !== null) {
    line(ctx, tip[0], tip[1], tip[0], shadowY, { color, width: 1, dash: [4, 4] });
    dot(ctx, tip[0], shadowY, 7, color, c.ink, 2);
  }
  return tip;
}
