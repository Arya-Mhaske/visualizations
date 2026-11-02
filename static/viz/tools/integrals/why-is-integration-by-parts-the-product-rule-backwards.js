import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { exact } from './_ig.js';

// Walk a curve v = h(u) from the origin to (U, V). Under the curve is ∫v du, to its left is ∫u dv, and together they fill the U × V rectangle.
const CURVES = {
  sq: ['v = u²', (u) => u * u, (v) => Math.sqrt(v), 2],
  root: ['v = √u', (u) => Math.sqrt(u), (v) => v * v, 4],
  sin: ['v = sin u', Math.sin, Math.asin, 1.5],
  exp: ['v = eᵘ − 1', (u) => Math.exp(u) - 1, (v) => Math.log(1 + v), 1.6],
};
const state = { k: 'sq', p: 0.7 };
const Umax = (s) => CURVES[s.k][3];
const U = (s) => s.p * Umax(s);

const tool = createTool({
  state,
  label: 'A curve v against u starting at the origin, with a rectangle from the origin to the chosen point. The area under the curve is blue, the area to the left of the curve is coral, and together they fill the rectangle exactly.',
  setup: (stage, c) => createPlot(stage, { x: [0, 2.4], y: [0, 4], c, pad: 28 }),
  draw(ctx, stage, c, plot) {
    const [, h, hinv, um] = CURVES[state.k];
    const u1 = U(state);
    const v1 = h(u1);
    plot.setRange([-0.05 * um, um * 1.1], [-0.05 * h(um), h(um) * 1.1]);
    plot.axes({ xLabel: 'u', yLabel: 'v' });
    plot.shade(h, null, 0, u1, c.fillB);
    // left of the curve: u from 0 to hinv(v), for v in 0..v1. Drawn as thin horizontal strips.
    const N = 160;
    for (let i = 0; i < N; i++) {
      const va = (v1 * i) / N;
      const vb = (v1 * (i + 1)) / N;
      const [x0, y0] = plot.toPx(0, va);
      const [x1, y1] = plot.toPx(hinv(vb), vb);
      ctx.fillStyle = c.fillA;
      ctx.fillRect(x0, y1, x1 - x0, y0 - y1 + 0.6);
    }
    plot.fn(h, { color: c.ink, width: 3, domain: [0, um] });
    plot.segment(0, v1, u1, v1, { color: c.ink, width: 2, dash: [5, 4] });
    plot.segment(u1, 0, u1, v1, { color: c.ink, width: 2, dash: [5, 4] });
    plot.point(u1, v1, { fill: c.a, r: 7 });
  },
  controls: () => [
    { title: 'Fill the rectangle' },
    { key: 'k', label: 'Curve', options: Object.entries(CURVES).map(([k, v]) => [k, v[0]]) },
    { key: 'p', label: 'Walk along the curve', min: 0.1, max: 1, step: 0.01, format: (v) => `u = ${fixed(v * CURVES[state.k][3], 2)}` },
    { readout: [
      ['∫ v du (under)', (s) => fixed(exact(CURVES[s.k][1], 0, U(s)), 4)],
      ['∫ u dv (left)', (s) => fixed(exact((v) => CURVES[s.k][2](v), 0, CURVES[s.k][1](U(s))), 4)],
      ['Sum', (s) => fixed(exact(CURVES[s.k][1], 0, U(s)) + exact((v) => CURVES[s.k][2](v), 0, CURVES[s.k][1](U(s))), 4)],
      ['u × v (rectangle)', (s) => fixed(U(s) * CURVES[s.k][1](U(s)), 4)],
    ] },
  ],
  tex: (s) => `\\int u\\,dv+\\int v\\,du=uv\\ \\Rightarrow\\ \\int u\\,dv=uv-\\int v\\,du`,
});

tool.update();
