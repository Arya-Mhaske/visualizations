import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { label, poly } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

const state = { W: 24, L: 36, x: 4 };
const vol = (s, x) => x * (s.W - 2 * x) * (s.L - 2 * x);
// V′(x) = 12x² − 4(W + L)x + 2WL = 0, smaller root
const best = (s) => { const a = 12; const b = -4 * (s.W + s.L); const c = 2 * s.W * s.L; return (-b - Math.sqrt(b * b - 4 * a * c)) / (2 * a); };
const lower = (stage) => ({ x: 0, y: stage.h * 0.44, w: stage.w, h: stage.h * 0.56 });

createTool({
  state,
  label: 'Top: a flat sheet with a square cut from each corner. Folding up the sides makes an open-top box of height x. Bottom: the volume of the box against x, which is a cubic. Small cuts make a wide, shallow box, big cuts a tall, thin one, and the volume is largest at one value in between. The best cut is marked.',
  setup: (stage, c) => createPlot(stage, { x: [0, 12], y: [0, 3000], c, box: lower, pad: 22 }),
  draw(ctx, stage, c, plot) {
    const k = Math.min((stage.w * 0.8) / state.L, (stage.h * 0.34) / state.W);
    const [x0, y0] = [(stage.w - state.L * k) / 2, stage.h * 0.04];
    const rect = (u, v, w, h, fill) => poly(ctx, [[x0 + u * k, y0 + v * k], [x0 + (u + w) * k, y0 + v * k], [x0 + (u + w) * k, y0 + (v + h) * k], [x0 + u * k, y0 + (v + h) * k]], { fill, stroke: c.ink, width: 2 });
    rect(0, 0, state.L, state.W, c.fillB);
    [[0, 0], [state.L - state.x, 0], [0, state.W - state.x], [state.L - state.x, state.W - state.x]].forEach(([u, v]) => rect(u, v, state.x, state.x, c.paper));
    label(ctx, `${state.L} × ${state.W} sheet, cut ${state.x}`, stage.w / 2, y0 + state.W * k + 14, c, { size: 11, bounds: stage });
    const top = vol(state, best(state)) * 1.2;
    plot.setRange([0, state.W / 2], [0, top]);
    plot.axes({ xLabel: 'cut x', yLabel: 'volume' });
    plot.fn((x) => vol(state, x), { color: c.a, width: 4, domain: [0, state.W / 2] });
    plot.point(state.x, vol(state, state.x), { fill: c.fillY, r: 9 });
    plot.point(best(state), vol(state, best(state)), { fill: c.c, r: 6 });
  },
  controls: [
    { title: 'Cut the corners' },
    { key: 'x', label: 'Size of the cut, x', min: 0.5, max: 11.5, step: 0.5, format: (v) => `${v} cm` },
    { key: 'W', label: 'Sheet width', min: 12, max: 30, step: 2, format: (v) => `${v} cm` },
    { key: 'L', label: 'Sheet length', min: 20, max: 50, step: 2, format: (v) => `${v} cm` },
    { readout: [
      ['Box size', (s) => `${fixed(s.L - 2 * s.x, 1)} × ${fixed(s.W - 2 * s.x, 1)} × ${s.x} cm`],
      ['Volume', (s) => `${fixed(vol(s, s.x), 0)} cm³`],
      ['Best cut', (s) => ({ text: `${fixed(best(s), 2)} cm  (${fixed(vol(s, best(s)), 0)} cm³)`, good: Math.abs(s.x - best(s)) < 0.3 })],
    ] },
  ],
  onChange(s) { if (s.W > s.L) s.L = s.W + 2; if (s.x >= s.W / 2) s.x = s.W / 2 - 0.5; },
  tex: (s) => `V=x(${s.L}-2x)(${s.W}-2x)=${fixed(vol(s, s.x), 0)}\\text{ cm}^3`,
});
