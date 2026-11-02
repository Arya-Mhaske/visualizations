// Drawing for the linear-programming tools. The plot window is [x0, x1] × [y0, y1] in plane units.
//   shadeRegion(ctx, plot, cons, box, fill)    the part of the window satisfying every constraint, as a filled polygon
//   boundary(plot, k, box, opts)               the boundary line of one constraint, across the window
//   objectiveLine(plot, a, b, z, box, opts)    the line a x + b y = z
import { poly } from '../../lib/draw.js';
import { clipHalf } from './_sm-math.js';

export function shadeRegion(ctx, plot, cons, box, { fill, stroke, width = 3 } = {}) {
  const [x0, y0, x1, y1] = box;
  let region = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  for (const k of cons) region = region.length ? clipHalf(region, k) : region;
  if (region.length < 3) return region;
  poly(ctx, region.map((p) => plot.toPx(...p)), { fill, stroke, width });
  return region;
}

export function boundary(plot, k, box, options = {}) {
  const [x0, y0, x1, y1] = box;
  if (Math.abs(k.a) < 1e-9 && Math.abs(k.b) < 1e-9) return;
  if (Math.abs(k.b) > 1e-9) plot.segment(x0, (k.c - k.a * x0) / k.b, x1, (k.c - k.a * x1) / k.b, options);
  else plot.segment(k.c / k.a, y0, k.c / k.a, y1, options);
}

export const objectiveLine = (plot, a, b, z, box, options = {}) => boundary(plot, { a, b, c: z }, box, options);
