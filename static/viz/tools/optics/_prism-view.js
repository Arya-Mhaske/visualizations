// Drawing a prism and the rays through it. A prism has its apex up. Used by the prism-dispersion tools.
//   drawPrism(ctx, c, box, A, rays)   box = { x, y, w, h } in pixels; rays = [{ n, i, color, width }] (angle of incidence in degrees)
//   returns { toPx, results } with results[k] = { out: [dx, dy] | null, D } for each ray.
import { refract } from '../../lib/rays.js';
import { rad, deg } from './_prism-math.js';

const H = 2;
export function drawPrism(ctx, c, box, A, rays, { screenX = null } = {}) {
  const half = rad(A / 2);
  const b = H * Math.tan(half);
  const s = Math.min(box.w / 7, box.h / (H + 1.4));
  const ox = box.x + box.w / 2 - 0.6 * s;
  const oy = box.y + box.h - 0.7 * s;
  const toPx = (x, y) => [ox + x * s, oy - y * s];
  const apex = [0, H];
  const bl = [-b, 0];
  const br = [b, 0];
  ctx.beginPath();
  [bl, apex, br].forEach((p, k) => {
    const [px, py] = toPx(...p);
    if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  });
  ctx.closePath();
  ctx.fillStyle = c.fillB;
  ctx.fill();
  ctx.strokeStyle = c.ink;
  ctx.lineWidth = 3;
  ctx.stroke();
  const P1 = [bl[0] + (apex[0] - bl[0]) * 0.5, bl[1] + (apex[1] - bl[1]) * 0.5];
  const n1 = [-Math.cos(half), Math.sin(half)]; // outward normal of the left face
  const n2 = [Math.cos(half), Math.sin(half)]; // outward normal of the right face
  const line = (a, bPt, color, width = 3) => {
    ctx.beginPath();
    ctx.moveTo(...toPx(...a));
    ctx.lineTo(...toPx(...bPt));
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
  };
  const results = rays.map((ray) => {
    const a = rad(ray.i) - half;
    const d = [Math.cos(a), Math.sin(a)];
    const start = [P1[0] - d[0] * 2.4, P1[1] - d[1] * 2.4];
    line(start, P1, ray.incident || c.ink, 3);
    const inside = refract(d, n1, 1, ray.n);
    if (!inside) return { out: null, D: null };
    // where it meets the right face: P1 + t inside lies on the line through apex and br
    const e = [br[0] - apex[0], br[1] - apex[1]];
    const rhs = [apex[0] - P1[0], apex[1] - P1[1]];
    const det = inside[0] * -e[1] - inside[1] * -e[0];
    const t = (rhs[0] * -e[1] - rhs[1] * -e[0]) / det;
    const P2 = [P1[0] + inside[0] * t, P1[1] + inside[1] * t];
    line(P1, P2, ray.color, ray.width || 3);
    const out = refract(inside, [-n2[0], -n2[1]], ray.n, 1);
    if (!out) return { out: null, D: null, P2 };
    const length = screenX === null ? 3 : Math.max(0.5, (screenX - P2[0]) / Math.max(out[0], 0.05));
    line(P2, [P2[0] + out[0] * length, P2[1] + out[1] * length], ray.color, ray.width || 3);
    const D = deg(Math.acos(Math.max(-1, Math.min(1, d[0] * out[0] + d[1] * out[1]))));
    return { out, D, P2, end: [P2[0] + out[0] * length, P2[1] + out[1] * length] };
  });
  return { toPx, results, scale: s };
}
