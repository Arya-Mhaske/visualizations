// Two ready-made tool shapes, so a simple tool is only its state, curves and readouts.
//   plotTool({ state, label, x, y, xLabel, yLabel, range, shades, curves, segments, points, texts, draw, controls, tex, onChange })
//     range(s) -> [[x0, x1], [y0, y1]] (optional, set every draw)
//     shades(s, c)   -> [[f, g|null, a, b, fill]]       curves(s, c)   -> [[f, { color, dash, domain }]]
//     segments(s, c) -> [[x1, y1, x2, y2, { color, width, dash }]]
//     points(s, c)   -> [[x, y, fill, r?]]              texts(s) -> [[text, x, y, opts?]]
//     draw(ctx, stage, c, plot) runs last for anything else (it may use plot.toPx).
//   barTool({ state, label, rows, max, left, draw, controls, tex, onChange })
//     rows(s, c) -> [[name, value, fill, text?]]  (see quick.js bars)
//   Both return the createTool result.
import { createTool } from './tool.js';
import { createPlot } from './plot.js';
import { bars } from './quick.js';

export function plotTool({ state, label, x = [0, 1], y = [0, 1], xLabel = '', yLabel = '', range, shades, curves, segments, points, texts, draw, controls, tex, onChange }) {
  return createTool({
    state,
    label,
    setup: (stage, c) => createPlot(stage, { x, y, c }),
    draw(ctx, stage, c, plot) {
      const r = range?.(state, stage);
      if (r) plot.setRange(r[0], r[1]);
      plot.axes({ xLabel, yLabel });
      (shades?.(state, c) || []).forEach(([f, g, a, b, fill]) => plot.shade(f, g, a, b, fill));
      (curves?.(state, c) || []).forEach(([f, opt]) => plot.fn(f, opt));
      (segments?.(state, c) || []).forEach(([x1, y1, x2, y2, opt]) => plot.segment(x1, y1, x2, y2, opt));
      (points?.(state, c) || []).forEach(([px, py, fill, rad]) => plot.point(px, py, { fill, r: rad }));
      (texts?.(state) || []).forEach(([s, tx, ty, o]) => plot.text(s, tx, ty, { patch: false, ...o }));
      draw?.(ctx, stage, c, plot);
    },
    controls,
    tex,
    onChange,
  });
}

export function barTool({ state, label, rows, max, left, draw, controls, tex, onChange }) {
  return createTool({
    state,
    label,
    draw(ctx, stage, c) {
      bars(ctx, stage, c, rows(state, c), { max: typeof max === 'function' ? max(state) : max, left });
      draw?.(ctx, stage, c);
    },
    controls,
    tex,
    onChange,
  });
}
