import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

const FNS = [
  { name: 'f(x) = √(x + 2)', f: (x) => (x < -2 ? NaN : Math.sqrt(x + 2)) },
  { name: 'f(x) = (x − 1)² − 1', f: (x) => (x - 1) ** 2 - 1 },
  { name: 'f(x) = eˣ', f: (x) => Math.exp(x) },
  { name: 'f(x) = x³ + 1', f: (x) => x ** 3 + 1 },
];
const state = { which: 0, x: 1, neg: true, mirror: true };
const F = (s = state) => FNS[s.which].f;

createTool({
  state,
  label: 'The graph of f in grey with its two reflections. Minus f of x, in coral, changes the sign of every output, so each point flips over the x-axis. F of minus x, in blue, changes the sign of every input, so each point flips over the y-axis. A marked point shows where one point goes under each. The two are different unless f has a special symmetry.',
  setup: (stage, c) => createPlot(stage, { x: [-6, 6], y: [-6, 6], c, pad: 18 }),
  draw(ctx, stage, c, plot) {
    plot.axes();
    const f = F();
    plot.fn(f, { color: c.grid, width: 4 });
    if (state.neg) plot.fn((x) => -f(x), { color: c.a, width: 4 });
    if (state.mirror) plot.fn((x) => f(-x), { color: c.b, width: 4 });
    const y = f(state.x);
    if (Number.isFinite(y)) {
      plot.point(state.x, y, { fill: c.paper, r: 7 });
      if (state.neg) plot.point(state.x, -y, { fill: c.a, r: 8 });
      if (state.mirror) plot.point(-state.x, y, { fill: c.b, r: 8 });
    }
  },
  controls: [
    { title: 'Flip the graph' },
    { key: 'which', label: 'Function', min: 0, max: FNS.length - 1, step: 1, format: (v) => FNS[v].name },
    { key: 'x', label: 'Marked point at x =', min: -1.5, max: 3, step: 0.5 },
    { key: 'neg', label: 'Show −f(x): flip over the x-axis', toggle: true },
    { key: 'mirror', label: 'Show f(−x): flip over the y-axis', toggle: true },
    { readout: [
      ['(x, f(x))', (s) => `(${s.x}, ${fixed(F(s)(s.x), 3)})`],
      ['Goes to, −f(x)', (s) => `(${s.x}, ${fixed(-F(s)(s.x), 3)})`],
      ['Goes to, f(−x)', (s) => `(${-s.x}, ${fixed(F(s)(s.x), 3)})`],
    ] },
  ],
  tex: () => '-f(x):\\ (x,y)\\to(x,-y)\\qquad f(-x):\\ (x,y)\\to(-x,y)',
});
