// Drawing helpers for the 2D linear-algebra tools. All take a createPlot plot and draw in plane coordinates.
//   plane(stage, c, half)                      a square plot [-half, half]² (equal axes on a square stage)
//   vec(ctx, plot, c, from, to, { color, text }) an arrow with an optional label at its tip
//   shape(ctx, plot, pts, M, { fill, stroke }) a polygon whose corners are sent through the 2 × 2 matrix M
//   curve(ctx, plot, pts, M, { color })        an open polyline through M
//   gridUnder(ctx, plot, M, { color, half })   the grid lines of the plane as M sends them
//   circlePts(n)                               points on the unit circle
//   F_SHAPE                                    an asymmetric letter F, so rotations and reflections show
import { createPlot } from '../../lib/plot.js';
import { arrow, label, poly } from '../../lib/draw.js';
import { apply2 } from './_la-math.js';

export const plane = (stage, c, half = 5) => createPlot(stage, { x: [-half, half], y: [-half, half], c, pad: 14 });

export const F_SHAPE = [[0, 0], [0, 2], [1.2, 2], [1.2, 1.65], [0.4, 1.65], [0.4, 1.3], [0.9, 1.3], [0.9, 0.95], [0.4, 0.95], [0.4, 0]];
export const SQUARE = [[0, 0], [1, 0], [1, 1], [0, 1]];

export function vec(ctx, plot, c, from, to, { color, width = 4, text = '', size = 12, dx = 10, dy = -10, head = 10 } = {}) {
  const [x0, y0] = plot.toPx(...from);
  const [x1, y1] = plot.toPx(...to);
  if (Math.hypot(x1 - x0, y1 - y0) < 2) return;
  arrow(ctx, x0, y0, x1, y1, { color: color || c.ink, width, head });
  if (text) label(ctx, text, x1 + dx, y1 + dy, c, { size, color: color || c.ink, patch: false });
}

export function shape(ctx, plot, pts, M, { fill, stroke, width = 3 } = {}) {
  poly(ctx, pts.map((p) => plot.toPx(...apply2(M, p))), { fill, stroke, width });
}

export function curve(ctx, plot, pts, M, { color, width = 3, closed = false } = {}) {
  poly(ctx, pts.map((p) => plot.toPx(...apply2(M, p))), { stroke: color, width, closed });
}

export function gridUnder(ctx, plot, M, { color, half = 6, width = 1.5 } = {}) {
  for (let k = -half; k <= half; k++) {
    curve(ctx, plot, [[k, -half], [k, half]], M, { color, width });
    curve(ctx, plot, [[-half, k], [half, k]], M, { color, width });
  }
}

export const circlePts = (n = 120) => Array.from({ length: n + 1 }, (_, i) => [Math.cos((2 * Math.PI * i) / n), Math.sin((2 * Math.PI * i) / n)]);

export const IDENTITY = [[1, 0], [0, 1]];
