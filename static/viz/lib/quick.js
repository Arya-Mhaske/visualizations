// Small drawing helpers shared by the quick mechanics tools (no state, no DOM).
//   G                                  9.8 m/s²
//   bars(ctx, stage, c, rows, opt)     horizontal bars; rows = [[label, value, fill, text?], ...]; opt: max, top, gap
//   vec(ctx, c, x, y, dx, dy, opt)     an arrow from (x, y) by (dx, dy) pixels with an optional label (opt.color, opt.text)
//   fitPath(plot, stage, xmax, ymax, ymin)   sets an (almost) equal-scale window holding x in [0, xmax], y in [ymin, ymax]
//   box(ctx, c, x, y, w, h, fill, text)      a labelled rectangle with the site outline (x, y = top-left)
import { poly, arrow, label } from './draw.js';

export const G = 9.8;

export function bars(ctx, stage, c, rows, { max = null, top = 16, gap = 10, left = 0.36 } = {}) {
  const m = max ?? Math.max(...rows.map((r) => Math.abs(r[1])), 1e-9);
  const h = Math.min(30, (stage.h - top - 10) / rows.length - gap);
  rows.forEach(([name, v, fill, text], i) => {
    const y = top + i * (h + gap);
    const w = (Math.abs(v) / m) * (stage.w * (0.96 - left));
    poly(ctx, [[stage.w * left, y], [stage.w * left + w, y], [stage.w * left + w, y + h], [stage.w * left, y + h]], { fill, stroke: c.ink, width: 2 });
    label(ctx, name, stage.w * left - 6, y + h / 2, c, { size: 11, align: 'right', patch: false });
    if (text) label(ctx, text, stage.w * left + w + 6, y + h / 2, c, { size: 11, align: 'left', bounds: stage, patch: false });
  });
}

export function vec(ctx, c, x, y, dx, dy, { color = c.ink, text = '', width = 3, head = 9 } = {}) {
  arrow(ctx, x, y, x + dx, y + dy, { color, width, head });
  if (text) label(ctx, text, x + dx + Math.sign(dx || 1) * 12, y + dy - 8, c, { size: 11, patch: false });
}

export function fitPath(plot, stage, xmax, ymax, ymin = 0) {
  const [w, h] = [Math.max(stage.w - 56, 50), Math.max(stage.h - 40, 50)];
  const xspan = Math.max(xmax * 1.12, ((ymax - ymin) * 1.2 * w) / h, 1e-6);
  const yspan = (xspan * h) / w;
  plot.setRange([-xspan * 0.06, xspan * 0.94], [ymin - yspan * 0.08, ymin + yspan * 0.92]);
}

export function box(ctx, c, x, y, w, h, fill, text = '') {
  poly(ctx, [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], { fill, stroke: c.ink });
  if (text) label(ctx, text, x + w / 2, y + h / 2, c, { size: 12, patch: false });
}
