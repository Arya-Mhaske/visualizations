// Drawing helpers for the Vector Calculus tools, on a createPlot() square plot.
import { arrow, line, poly } from '../../lib/draw.js';
import { contour } from '../vectors-3d/_quadric-surfaces-math.js';

export const RANGE = 5;
export const WINDOW = { x: [-RANGE, RANGE], y: [-RANGE, RANGE] };

// An arrow from (x, y) showing (vx, vy) at `k` pixels per unit, capped at `cap` px.
export function arrowAt(ctx, plot, x, y, vx, vy, { k = 20, cap = 60, color, width = 2, head = 8 } = {}) {
  const [px, py] = plot.toPx(x, y);
  const len = Math.hypot(vx, vy);
  if (len < 1e-12) return;
  const show = Math.min(cap, len * k);
  const [ex, ey] = [px + (vx / len) * show, py - (vy / len) * show];
  arrow(ctx, px, py, ex, ey, { color, width, head });
}
// An arrow field F(x, y) on a grid. Lengths grow with |F| but are squeezed so none overruns its neighbours.
export function fieldArrows(ctx, plot, F, c, { step = 1, reach = 4.5, color = c.b, width = 2, soft = 1.2 } = {}) {
  const cell = Math.abs(plot.toPx(step, 0)[0] - plot.toPx(0, 0)[0]);
  for (let x = -reach; x <= reach + 1e-9; x += step) {
    for (let y = -reach; y <= reach + 1e-9; y += step) {
      const v = F(x, y);
      const m = Math.hypot(v[0], v[1]);
      if (!Number.isFinite(m) || m < 1e-9) continue;
      const len = (cell * 0.85 * m) / (m + soft);
      arrowAt(ctx, plot, x, y, v[0], v[1], { k: 1e9, cap: len, color, width, head: Math.min(8, len * 0.5) });
    }
  }
}
// Level curves of f over the plot window.
export function drawContours(ctx, plot, f, levels, { color, width = 1.5 } = {}) {
  for (const level of levels) {
    for (const [p, q] of contour((x, y) => f(x, y) - level, -RANGE, RANGE, 70)) {
      line(ctx, ...plot.toPx(...p), ...plot.toPx(...q), { color, width });
    }
  }
}
// A path from t = a to t = b as a polyline.
export function drawPath(ctx, plot, path, { a = 0, b = 1, color, width = 4, n = 120 } = {}) {
  const pts = [];
  for (let i = 0; i <= n; i++) pts.push(plot.toPx(...path.r(a + ((b - a) * i) / n)));
  poly(ctx, pts, { stroke: color, width, closed: false });
}
// A little arrowhead on a path at parameter t, pointing along d.
export function pathArrow(ctx, plot, path, t, { color, width = 3 } = {}) {
  const [x, y] = path.r(t);
  const d = path.d(t);
  arrowAt(ctx, plot, x, y, d[0], d[1], { k: 1e9, cap: 22, color, width, head: 10 });
}
// A polygon given in world units.
export function drawPoly(ctx, plot, pts, options) {
  poly(ctx, pts.map(([x, y]) => plot.toPx(x, y)), options);
}
export const levelsFor = (S, count = 9, span = 8) => Array.from({ length: count }, (_, i) => -span + (2 * span * (i + 0.5)) / count).map((v) => v);
