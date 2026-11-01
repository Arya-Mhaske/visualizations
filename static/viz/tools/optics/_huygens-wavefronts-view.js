// Drawing helper shared by the Huygens & Wavefronts tools. No state.
import { line } from '../../lib/draw.js';

export const rad = (d) => (d * Math.PI) / 180;
export const deg = (r) => (r * 180) / Math.PI;

// A wavefront is the line {p : p . d = s} in world units (y up). `to` maps world to pixels.
export function front(ctx, to, d, s, color, width) {
  const t = [-d[1], d[0]];
  const [x1, y1] = to(d[0] * s - t[0] * 40, d[1] * s - t[1] * 40);
  const [x2, y2] = to(d[0] * s + t[0] * 40, d[1] * s + t[1] * 40);
  line(ctx, x1, y1, x2, y2, { color, width });
}
