import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { crossings } from '../trigonometry/_identities-math.js';

const FNS = [
  { name: 'x²', f: (x) => x * x },
  { name: 'x³', f: (x) => x ** 3 },
  { name: '|x|', f: Math.abs },
  { name: 'x³ − 3x', f: (x) => x ** 3 - 3 * x },
  { name: 'eˣ', f: Math.exp },
  { name: 'sin x', f: Math.sin },
];
const state = { which: 0, y: 2 };
const F = (s = state) => FNS[s.which].f;
const hits = (s) => crossings(F(s), () => s.y, -4, 4);
const worst = (s) => { let m = 0; for (let y = -6; y <= 8; y += 0.1) m = Math.max(m, crossings(F(s), () => y, -4, 4).length); return m; };

createTool({
  state,
  label: 'A graph and a horizontal line that you slide up and down. Each point where the line meets the graph is an input that gives that output. If the line ever meets the graph twice, then two different inputs give the same output, and undoing the function is ambiguous: which input should it return? A function can be inverted only if every horizontal line meets its graph at most once. Hit points are marked.',
  setup: (stage, c) => createPlot(stage, { x: [-4, 4], y: [-6, 8], c, pad: 18 }),
  draw(ctx, stage, c, plot) {
    plot.axes();
    plot.fn(F(), { color: c.a, width: 4 });
    plot.segment(-4, state.y, 4, state.y, { color: c.b, width: 3 });
    hits(state).forEach((x) => plot.point(x, state.y, { fill: c.fillY, r: 8 }));
  },
  controls: [
    { title: 'Sweep the line' },
    { key: 'which', label: 'Function', min: 0, max: FNS.length - 1, step: 1, format: (v) => FNS[v].name },
    { key: 'y', label: 'Height of the line', min: -5, max: 7, step: 0.1, format: (v) => v.toFixed(1) },
    { readout: [
      ['Hits at this height', (s) => ({ text: `${hits(s).length}`, good: hits(s).length <= 1 })],
      ['At x =', (s) => hits(s).map((x) => fixed(x, 2)).join(', ') || 'none'],
      ['Most hits at any height', (s) => ({ text: `${worst(s)}`, good: worst(s) <= 1 })],
      ['Can be inverted?', (s) => ({ text: worst(s) <= 1 ? 'yes: one-to-one' : 'no: two inputs share an output', good: worst(s) <= 1 })],
    ] },
  ],
  tex: (s) => `f(x)=${fixed(s.y, 1)}\\ \\text{has}\\ ${hits(s).length}\\ \\text{solution(s) in}\\ [-4,4]`,
});
