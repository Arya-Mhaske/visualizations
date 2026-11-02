import { createTool } from '../../lib/tool.js';
import { poly, label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

const state = { a: 5, b: 2 };

createTool({
  state,
  label: 'Left: a square with a smaller square removed from its corner, leaving an L-shape. Right: the same area rearranged into a rectangle with sides a plus b and a minus b.',
  draw(ctx, stage, c) {
    const { a, b } = state;
    const u = (stage.w * 0.4) / a;
    const [x0, y0] = [stage.w * 0.05, 40];
    poly(ctx, [[x0, y0], [x0 + a * u, y0], [x0 + a * u, y0 + (a - b) * u], [x0 + (a - b) * u, y0 + (a - b) * u], [x0 + (a - b) * u, y0 + a * u], [x0, y0 + a * u]], { fill: c.fillA, stroke: c.ink });
    poly(ctx, [[x0 + (a - b) * u, y0], [x0 + a * u, y0], [x0 + a * u, y0 + (a - b) * u], [x0 + (a - b) * u, y0 + (a - b) * u]], { fill: c.paper, stroke: c.ink, dash: [4, 4] });
    const rx = stage.w * 0.52;
    const rw = (a + b) * u * 0.45;
    poly(ctx, [[rx, y0 + 20], [rx + rw, y0 + 20], [rx + rw, y0 + 20 + (a - b) * u], [rx, y0 + 20 + (a - b) * u]], { fill: c.fillA, stroke: c.ink });
    label(ctx, `a² − b² = ${a * a - b * b}`, x0 + (a * u) / 2, y0 + a * u + 22, c, { size: 13, bounds: stage, patch: false });
    label(ctx, `(a + b)(a − b) = ${(a + b) * (a - b)}`, rx + rw / 2, y0 + 20 + (a - b) * u + 22, c, { size: 13, bounds: stage, patch: false });
    label(ctx, 'the L-shape, and the same area as a rectangle', stage.w / 2, 18, c, { size: 11, bounds: stage, patch: false });
    void fixed;
  },
  controls: [
    { title: 'Squares' },
    { key: 'a', label: 'Big side a', min: 2, max: 8, step: 1 },
    { key: 'b', label: 'Small side b', min: 1, max: 7, step: 1 },
    { readout: [['a² − b²', (s) => String(s.a ** 2 - s.b ** 2)], ['(a + b)(a − b)', (s) => String((s.a + s.b) * (s.a - s.b))]] },
  ],
  tex: (s) => `${s.a}^2-${s.b}^2=(${s.a}+${s.b})(${s.a}-${s.b})=${(s.a + s.b) * (s.a - s.b)}`,
  onChange: (s) => {
    s.b = Math.min(s.b, s.a - 1);
  },
});
