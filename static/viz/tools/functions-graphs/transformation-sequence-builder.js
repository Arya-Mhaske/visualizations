import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { PARENTS } from './_fx.js';

// y = a·f(b(x − h)) + k. Key points of the parent move with it.
const state = { p: 0, a: 1, b: 1, h: 0, k: 0 };
const P = (s = state) => PARENTS[s.p];
const g = (s, x) => s.a * P(s).f(s.b * (x - s.h)) + s.k;
const KEYS = { 0: [[0, 0], [1, 1], [-1, 1]], 1: [[0, 0], [1, 1], [-1, 1]], 2: [[0, 0], [1, 1], [-1, -1]], 3: [[0, 0], [1, 1], [4, 2]], 4: [[0, 0], [Math.PI / 2, 1], [Math.PI, 0]] };
const move = (s, [x, y]) => [x / s.b + s.h, s.a * y + s.k];
const sgn = (v) => (v < 0 ? `+${-v}` : `-${v}`);

createTool({
  state,
  label: 'A parent function in grey and the transformed graph y equals a times f of b times x minus h, plus k, in coral. Three key points of the parent are marked and followed to their new places. The sliders apply the changes in the usual order: the inside ones (b and h) act on x, so they work backwards, and the outside ones (a and k) act on the output.',
  setup: (stage, c) => createPlot(stage, { x: [-7, 7], y: [-7, 7], c, pad: 18 }),
  draw(ctx, stage, c, plot) {
    plot.setRange([-7, 7], [-7, 7]);
    plot.axes();
    plot.fn(P().f, { color: c.grid, width: 3 });
    plot.fn((x) => g(state, x), { color: c.a, width: 4 });
    KEYS[state.p].forEach((q) => {
      plot.point(q[0], q[1], { fill: c.paper, r: 6 });
      const m = move(state, q);
      plot.point(m[0], m[1], { fill: c.a, r: 7 });
    });
  },
  controls: [
    { title: 'Stack the changes' },
    { key: 'p', label: 'Parent function', min: 0, max: PARENTS.length - 1, step: 1, format: (v) => PARENTS[v].name },
    { key: 'a', label: 'a: stretch / reflect the output', min: -3, max: 3, step: 0.5 },
    { key: 'b', label: 'b: squeeze / reflect the input', min: -3, max: 3, step: 0.5 },
    { key: 'h', label: 'h: shift right', min: -4, max: 4, step: 0.5 },
    { key: 'k', label: 'k: shift up', min: -4, max: 4, step: 0.5 },
    { readout: [
      ['Order of changes', () => 'b, then h, then a, then k'],
      ['Key point (1, 1)', (s) => { const m = move(s, [1, P(s).f(1)]); return `(${fixed(m[0], 2)}, ${fixed(m[1], 2)})`; }],
    ] },
  ],
  onChange(s) { if (s.b === 0) s.b = 0.5; },
  tex: (s) => `y=${s.a}\\,${P(s).tex.replace('x', `(${s.b}(x${sgn(s.h)}))`)}${s.k < 0 ? '' : '+'}${s.k}`,
});
