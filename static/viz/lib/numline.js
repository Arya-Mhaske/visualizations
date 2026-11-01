// A horizontal number line on a canvas stage, for inequalities, distance and intervals.
//   const nl = numberLine(ctx, stage, c, { lo: -10, hi: 10, y: 80, pad: 22, step: 1 });
//   nl.px(x) and nl.val(px) convert.  nl.axis({ numbers: true })  draws the line, ticks and numbers.
//   nl.dot(x, { open: false, fill, r })   a closed (filled) or open (hollow) point.
//   nl.span(a, b, { color, width, openA, openB })  a thick bar from a to b, with end dots (a or b may be ±Infinity: it runs to the edge with an arrow).
//   nl.arrow(a, b, { color, dy })  an arrow from a to b, offset dy pixels from the line.
//   nl.text(s, x, dy, { color, size })  a label under (dy > 0) or over (dy < 0) the line.
// Colours come from readColors(); nothing here draws a hex code.
import { arrow, dot, label, line } from './draw.js';
import { fixed } from './format.js';

export function numberLine(ctx, stage, c, { lo = -10, hi = 10, y = stage.h / 2, pad = 22, step = 1 } = {}) {
  const px = (x) => pad + ((x - lo) / (hi - lo)) * (stage.w - pad * 2);
  const val = (p) => lo + ((p - pad) / (stage.w - pad * 2)) * (hi - lo);
  const clamp = (x) => Math.max(lo, Math.min(hi, x));

  function axis({ numbers = true, every = step } = {}) {
    line(ctx, pad - 6, y, stage.w - pad + 6, y, { color: c.ink, width: 3 });
    for (let v = Math.ceil(lo / every - 1e-9) * every; v <= hi + 1e-9; v += every) {
      line(ctx, px(v), y - 6, px(v), y + 6, { color: c.ink, width: 2 });
      if (numbers) label(ctx, fixed(v, 3), px(v), y + 20, c, { size: 10, bounds: stage, patch: false });
    }
  }
  function mark(x, { open = false, fill = c.a, r = 8 } = {}) {
    dot(ctx, px(clamp(x)), y, r, open ? c.paper : fill, c.ink);
  }
  function span(a, b, { color = c.a, width = 8, openA = false, openB = false, dy = 0 } = {}) {
    const [ca, cb] = [clamp(a), clamp(b)];
    line(ctx, px(ca), y + dy, px(cb), y + dy, { color, width });
    if (Number.isFinite(a)) dot(ctx, px(ca), y + dy, 7, openA ? c.paper : color, c.ink);
    else arrow(ctx, px(ca) + 14, y + dy, px(ca) - 2, y + dy, { color, width, head: 12 });
    if (Number.isFinite(b)) dot(ctx, px(cb), y + dy, 7, openB ? c.paper : color, c.ink);
    else arrow(ctx, px(cb) - 14, y + dy, px(cb) + 2, y + dy, { color, width, head: 12 });
  }
  function arrowFromTo(a, b, { color = c.a, dy = -22, width = 4 } = {}) {
    arrow(ctx, px(clamp(a)), y + dy, px(clamp(b)), y + dy, { color, width });
  }
  function text(s, x, dy = 36, { color, size = 11 } = {}) {
    label(ctx, s, px(clamp(x)), y + dy, c, { size, color, bounds: stage, patch: false });
  }
  return { px, val, axis, dot: mark, span, arrow: arrowFromTo, text, y };
}
