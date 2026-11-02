import { createTool } from '../../lib/tool.js';
import { arc, dot, label, line } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { TAU, rad, deg } from './_inverses-math.js';
import { makePlot, fit } from './_sine-cosine-view.js';

const state = { h: 0.5 };
const X0 = -TAU;
const SPAN = 2 * TAU;
const theta = () => Math.asin(state.h);
const solutions = () => {
  const out = [];
  for (let k = -2; k <= 2; k++) {
    for (const [x, fam] of [[theta() + TAU * k, 0], [Math.PI - theta() + TAU * k, 1]]) if (x >= X0 - 1e-9 && x <= X0 + SPAN + 1e-9) out.push([x, fam]);
  }
  return out;
};

createTool({
  state,
  label: 'Left: a unit circle with a horizontal line at height h meeting it at two points. Right: the sine graph over two full turns with the same line meeting it again and again. Each turn of the circle repeats the same two solutions.',
  setup: (stage, c) => makePlot(stage, c, { x0: X0, span: SPAN }),
  draw(ctx, stage, c, plot) {
    fit(stage, plot, X0, SPAN);
    const ppu = (stage.w * 0.19) / 1.6;
    const cx = stage.w * 0.2 - 4;
    const cy = plot.toPx(0, 0)[1];
    plot.axes({ xLabel: 'x', yLabel: 'sin x' });
    plot.fn(Math.sin, { color: c.ink, width: 3 });
    arc(ctx, cx, cy, ppu, 0, TAU, { color: c.ink, width: 2 });
    line(ctx, cx - ppu * 1.3, cy, cx + ppu * 1.3, cy, { color: c.grid, width: 1 });
    line(ctx, cx, cy - ppu * 1.3, cx, cy + ppu * 1.3, { color: c.grid, width: 1 });
    const yh = plot.toPx(0, state.h)[1];
    line(ctx, cx - ppu * 1.3, yh, stage.w - 8, yh, { color: c.d, width: 3 });
    const t = theta();
    for (const [a, colour] of [[t, c.a], [Math.PI - t, c.b]]) {
      line(ctx, cx, cy, cx + ppu * Math.cos(a), cy - ppu * Math.sin(a), { color: colour, width: 3 });
      dot(ctx, cx + ppu * Math.cos(a), cy - ppu * Math.sin(a), 7, colour, c.ink);
    }
    for (const [x, fam] of solutions()) dot(ctx, ...plot.toPx(x, state.h), 6, fam ? c.b : c.a, c.ink, 2);
    label(ctx, 'h', cx - ppu * 1.4, yh - 8, c, { size: 11, color: c.d, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Choose the height' },
    { key: 'h', label: 'sin x =', min: -1, max: 1, step: 0.05, format: (n) => fixed(n, 2) },
    { readout: [
      ['Reference angle', () => `${fixed(deg(Math.asin(Math.abs(state.h))), 1)}°`],
      ['First solution', () => `${fixed(deg(theta()), 1)}°`],
      ['Second solution', () => `${fixed(180 - deg(theta()), 1)}°`],
      ['Hits in this window', () => String(solutions().length)],
    ] },
  ],
  tex: (s) => `x=${fixed(deg(Math.asin(s.h)), 1)}^\\circ+360^\\circ k\\quad\\text{or}\\quad x=${fixed(180 - deg(Math.asin(s.h)), 1)}^\\circ+360^\\circ k`,
});
void rad;
