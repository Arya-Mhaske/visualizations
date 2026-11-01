import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

const FNS = [
  { name: 'x', f: (x) => x },
  { name: 'x²', f: (x) => x * x },
  { name: 'sin x', f: Math.sin },
  { name: '2', f: () => 2 },
  { name: 'eˣ ÷ 4', f: (x) => Math.exp(x) / 4 },
];
const OPS = { add: ['+', (a, b) => a + b], sub: ['−', (a, b) => a - b], mul: ['×', (a, b) => a * b] };
const state = { f: 1, g: 2, op: 'add', x: 1.5 };
const F = (s = state) => FNS[s.f].f;
const G = (s = state) => FNS[s.g].f;
const combo = (s, x) => OPS[s.op][1](F(s)(x), G(s)(x));

createTool({
  state,
  label: 'Two graphs, f in blue and g in grey, and their combination in coral, found point by point. At each x the two heights are added, subtracted or multiplied, and the result is the height of the coral graph at the same x. A vertical probe at x shows the two heights and the combined one. The domain of the combination is where both f and g are defined.',
  setup: (stage, c) => createPlot(stage, { x: [-4, 4], y: [-6, 8], c, pad: 18 }),
  draw(ctx, stage, c, plot) {
    plot.axes();
    plot.fn(F(), { color: c.b, width: 3 });
    plot.fn(G(), { color: c.grid, width: 3 });
    plot.fn((x) => combo(state, x), { color: c.a, width: 4 });
    plot.segment(state.x, 0, state.x, F()(state.x), { color: c.b, width: 4 });
    plot.segment(state.x, 0, state.x, G()(state.x), { color: c.grid, width: 4 });
    plot.point(state.x, combo(state, state.x), { fill: c.fillY, r: 9 });
  },
  controls: [
    { title: 'Combine two functions' },
    { key: 'f', label: 'f', min: 0, max: FNS.length - 1, step: 1, format: (v) => FNS[v].name },
    { key: 'g', label: 'g', min: 0, max: FNS.length - 1, step: 1, format: (v) => FNS[v].name },
    { key: 'op', label: 'Operation', options: [['add', 'f + g'], ['sub', 'f − g'], ['mul', 'f × g']] },
    { key: 'x', label: 'Probe at x =', min: -3.5, max: 3.5, step: 0.1, format: (v) => v.toFixed(1) },
    { readout: [
      ['f(x), g(x)', (s) => `${fixed(F(s)(s.x), 3)}, ${fixed(G(s)(s.x), 3)}`],
      ['Combined', (s) => ({ text: fixed(combo(s, s.x), 3), good: true })],
    ] },
  ],
  tex: (s) => `(f ${OPS[s.op][0]} g)(${s.x.toFixed(1)})=${fixed(F(s)(s.x), 3)} ${OPS[s.op][0]} ${fixed(G(s)(s.x), 3)}=${fixed(combo(s, s.x), 3)}`,
});
