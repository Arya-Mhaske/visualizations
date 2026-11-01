import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { PARENTS } from './_fx.js';

const state = { p: 4, c: 2, mode: 'in' };
const P = (s = state) => PARENTS[s.p];
const g = (s, x) => (s.mode === 'in' ? P(s).f(s.c * x) : s.c * P(s).f(x));
// a marked point of f, and where it lands
const KEY = (s) => (s.p === 4 ? [Math.PI / 2, 1] : s.p === 3 ? [4, 2] : [2, P(s).f(2)]);

createTool({
  state,
  label: 'The graph of f in grey with a marked point on it. In the first mode the input is multiplied by c, giving f of c x. A point that was at x now needs only x over c to get the same output, so the graph is squeezed towards the vertical axis when c is bigger than 1: the horizontal change acts backwards. In the second mode the output is multiplied, giving c times f of x, and every height is multiplied by c: a stretch.',
  setup: (stage, c) => createPlot(stage, { x: [-7, 7], y: [-6, 8], c, pad: 18 }),
  draw(ctx, stage, c, plot) {
    plot.setRange([-7, 7], [-6, 8]);
    plot.axes();
    plot.fn(P().f, { color: c.grid, width: 4 });
    plot.fn((x) => g(state, x), { color: c.a, width: 4 });
    const [kx, ky] = KEY(state);
    plot.point(kx, ky, { fill: c.paper, r: 7 });
    plot.point(state.mode === 'in' ? kx / state.c : kx, state.mode === 'in' ? ky : ky * state.c, { fill: c.a, r: 8 });
  },
  controls: [
    { title: 'Change the input or the output' },
    { key: 'mode', label: 'Change', options: [['in', 'Input: f(c·x)'], ['out', 'Output: c·f(x)']] },
    { key: 'c', label: 'Factor, c', min: 0.5, max: 3, step: 0.5 },
    { key: 'p', label: 'Function f', min: 0, max: 4, step: 1, format: (v) => PARENTS[v].name },
    { readout: [
      ['The marked point moves from', (s) => `(${fixed(KEY(s)[0], 2)}, ${fixed(KEY(s)[1], 2)})`],
      ['to', (s) => (s.mode === 'in' ? `(${fixed(KEY(s)[0] / s.c, 2)}, ${fixed(KEY(s)[1], 2)})` : `(${fixed(KEY(s)[0], 2)}, ${fixed(KEY(s)[1] * s.c, 2)})`)],
      ['Effect', (s) => (s.c === 1 ? 'none' : s.mode === 'in' ? (s.c > 1 ? 'squeezed sideways by c' : 'stretched sideways by 1/c') : (s.c > 1 ? 'stretched upward by c' : 'squashed by c'))],
    ] },
  ],
  tex: (s) => (s.mode === 'in' ? `f(${s.c}x)\\ \\text{reaches the old output at}\\ x=\\dfrac{x_{\\text{old}}}{${s.c}}` : `${s.c}f(x)\\ \\text{multiplies every height by}\\ ${s.c}`),
});
