import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { boxes, speck, tangent, num } from './_da.js';

// At x = 0 every one of these has f′ = 0. The test is what the neighbours do: compare f(−δ) and f(δ) with f(0).
const FN = {
  cube: { name: 'x³', f: (x) => x ** 3, d: (x) => 3 * x * x },
  sq: { name: 'x²', f: (x) => x * x, d: (x) => 2 * x },
  nsq: { name: '−x²', f: (x) => -x * x, d: (x) => -2 * x },
  nq: { name: '−x⁴', f: (x) => -(x ** 4), d: (x) => -4 * x ** 3 },
  fifth: { name: 'x⁵', f: (x) => x ** 5, d: (x) => 5 * x ** 4 },
};
const state = { fn: 'cube', delta: 0.6 };
const K = () => FN[state.fn];
const verdict = () => {
  const [l, r, m] = [K().f(-state.delta), K().f(state.delta), K().f(0)];
  if (l > m && r > m) return { text: 'both neighbours higher: a minimum', good: true };
  if (l < m && r < m) return { text: 'both neighbours lower: a maximum', good: true };
  return { text: 'one higher, one lower: neither', good: false };
};
const [bA, bB] = boxes(2);

createTool({
  state,
  label: 'Top: a graph with a flat tangent at the origin and two probe points either side. Bottom: its slope, which touches zero at the origin.',
  setup: (stage, c) => ({ a: createPlot(stage, { x: [-1.2, 1.2], y: [-1.5, 1.5], c, box: bA }), b: createPlot(stage, { x: [-1.2, 1.2], y: [-1, 4], c, box: bB }) }),
  draw(ctx, stage, c, { a, b }) {
    const k = K();
    a.axes({ xLabel: 'x', yLabel: 'f' });
    a.fn(k.f, { color: c.ink, width: 3 });
    tangent(a, 0, 0, 0, 0.5, c.a, 3);
    a.segment(-1.2, k.f(0), 1.2, k.f(0), { color: c.grid, width: 1.5 });
    for (const x of [-state.delta, state.delta]) { a.segment(x, 0, x, k.f(x), { color: c.b, width: 2, dash: [4, 4] }); speck(ctx, a, x, k.f(x), 6, c.b, c.ink); }
    a.point(0, 0, { fill: c.a });
    b.setRange([-1.2, 1.2], [-4, 4]);
    b.axes({ xLabel: 'x', yLabel: "f′" });
    b.fn(k.d, { color: c.b, width: 3 });
    b.point(0, 0, { fill: c.a });
  },
  controls: [
    { title: 'Probe the neighbours' },
    { key: 'fn', label: 'Function', options: Object.entries(FN).map(([k, v]) => [k, v.name]) },
    { key: 'delta', label: 'Distance δ from 0', min: 0.1, max: 1.1, step: 0.05, format: (v) => v.toFixed(2) },
    { readout: [
      ["f′(0)", () => num(K().d(0), 3)],
      ['f(−δ), f(0), f(δ)', () => `${num(K().f(-state.delta), 3)}, 0, ${num(K().f(state.delta), 3)}`],
      ['Verdict at 0', verdict],
    ] },
  ],
  tex: () => "f'(0)=0\\ \\not\\Rightarrow\\ \\text{peak or valley}",
});
