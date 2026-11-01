import { createTool } from '../../lib/tool.js';
import { arc, label, line, poly } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

const state = { n: 8 };
const r = 1;
const rings = (n) => Array.from({ length: n }, (_, k) => ({ mid: ((k + 0.5) * r) / n, w: r / n }));
const strips = (n) => rings(n).reduce((s, g) => s + 2 * Math.PI * g.mid * g.w, 0);

createTool({
  state,
  label: 'Top: a disc cut into thin rings. Bottom: the rings are cut open and unrolled into straight strips and stacked, smallest on top. A ring at distance d from the centre is a strip of length 2 pi d, so the strips grow steadily longer and make a triangle with base 2 pi r and height r. The more rings, the thinner the steps and the closer the stack is to a perfect triangle of area half base times height, which is pi r squared.',
  draw(ctx, stage, c) {
    const R = Math.min(stage.w * 0.2, stage.h * 0.19);
    const O = [stage.w / 2, stage.h * 0.23];
    rings(state.n).forEach((g, k) => {
      const hi = ((k + 1) * R) / state.n;
      ctx.save();
      ctx.beginPath();
      ctx.arc(...O, hi, 0, Math.PI * 2);
      ctx.arc(...O, (k * R) / state.n, 0, Math.PI * 2, true);
      ctx.fillStyle = k % 2 ? c.fillA : c.fillB;
      ctx.fill();
      ctx.restore();
    });
    arc(ctx, ...O, R, 0, Math.PI * 2, { color: c.ink, width: 3 });
    const baseY = stage.h * 0.93;
    const full = stage.w * 0.8;
    const h = stage.h * 0.42 / state.n;
    rings(state.n).forEach((g, k) => {
      const len = (g.mid / r) * full;
      const y = baseY - (state.n - k) * h;
      poly(ctx, [[(stage.w - len) / 2, y], [(stage.w + len) / 2, y], [(stage.w + len) / 2, y + h], [(stage.w - len) / 2, y + h]], { fill: k % 2 ? c.fillA : c.fillB, stroke: c.ink, width: 1 });
    });
    line(ctx, (stage.w - full) / 2, baseY, (stage.w + full) / 2, baseY, { color: c.ink, width: 3 });
    label(ctx, '2πr', stage.w / 2, baseY + 12, c, { size: 11, bounds: stage, patch: false });
    label(ctx, 'r', stage.w * 0.92, baseY - stage.h * 0.21, c, { size: 11, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Cut into rings' },
    { key: 'n', label: 'Number of rings', min: 2, max: 40, step: 1 },
    { readout: [
      ['Area of all strips (r = 1)', (s) => fixed(strips(s.n), 5)],
      ['Triangle ½ · 2π · 1', () => fixed(Math.PI, 5)],
      ['Staircase vs triangle: width of each step', (s) => fixed((2 * Math.PI) / s.n, 3)],
    ] },
  ],
  tex: (s) => `\\tfrac12(2\\pi r)(r)=\\pi r^2\\quad(${s.n}\\ \\text{rings: }${fixed(strips(s.n), 4)}\\ \\text{for}\\ r=1)`,
});
