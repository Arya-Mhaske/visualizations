import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

const state = { a: 1, b: -4, c: 1 };
const f = (s, x) => s.a * x * x + s.b * x + s.c;
const D = (s) => s.b * s.b - 4 * s.a * s.c;
const roots = (s) => (D(s) < 0 ? [] : [(-s.b - Math.sqrt(D(s))) / (2 * s.a), (-s.b + Math.sqrt(D(s))) / (2 * s.a)]);
const vx = (s) => -s.b / (2 * s.a);

createTool({
  state,
  label: 'A parabola with its axis of symmetry drawn as a dashed vertical line through the vertex. When the parabola crosses the x-axis, the two roots are the same distance from that line, so the vertex sits exactly halfway between them. The halfway point of the roots is minus b over 2a, because the two roots are minus b over 2a plus or minus the same square root over 2a.',
  setup: (stage, c) => createPlot(stage, { x: [-6, 8], y: [-8, 12], c, pad: 18 }),
  draw(ctx, stage, c, plot) {
    plot.axes();
    plot.fn((x) => f(state, x), { color: c.a, width: 4 });
    plot.segment(vx(state), -8, vx(state), 12, { color: c.grid, width: 2, dash: [6, 5] });
    plot.point(vx(state), f(state, vx(state)), { fill: c.fillY, r: 9 });
    roots(state).forEach((r) => plot.point(r, 0, { fill: c.c, r: 7 }));
    if (roots(state).length) plot.segment(roots(state)[0], -0.8, roots(state)[1], -0.8, { color: c.b, width: 4 });
  },
  controls: [
    { title: 'Choose the parabola' },
    { key: 'a', label: 'a', min: -3, max: 3, step: 0.5 },
    { key: 'b', label: 'b', min: -8, max: 8, step: 0.5 },
    { key: 'c', label: 'c', min: -6, max: 6, step: 0.5 },
    { readout: [
      ['Roots', (s) => (roots(s).length ? roots(s).map((r) => fixed(r, 3)).join(', ') : 'none: use completing the square')],
      ['Halfway between roots', (s) => (roots(s).length ? fixed((roots(s)[0] + roots(s)[1]) / 2, 3) : '—')],
      ['−b ÷ 2a', (s) => ({ text: fixed(vx(s), 3), good: true })],
    ] },
  ],
  onChange(s) { if (s.a === 0) s.a = 1; },
  tex: (s) => `x_v=-\\dfrac{b}{2a}=-\\dfrac{${s.b}}{2(${s.a})}=${fixed(vx(s), 3)}`,
});
