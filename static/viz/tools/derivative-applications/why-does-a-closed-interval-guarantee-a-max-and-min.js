import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { dot } from '../../lib/draw.js';
import { num } from './_da.js';

// Extreme Value Theorem: continuous f on a closed, bounded [a, b] attains a max and a min.
// Break "continuous", "closed" or "bounded" and the biggest value may never be reached. We hunt with N sample points.
const CASES = {
  good: { name: 'Continuous on [0, 6]  (the theorem applies)', a: 0, b: 6, ends: [true, true], f: (x) => Math.sin(x) + 0.3 * x, y: [-1.5, 3.5], sup: Math.sin(6) + 1.8 },
  open: { name: 'f(x) = x on the OPEN interval (0, 2)', a: 0, b: 2, ends: [false, false], f: (x) => x, y: [-0.5, 2.5], sup: 2 },
  jump: { name: 'A jump at x = 1 on [0, 2]', a: 0, b: 2, ends: [true, true], f: (x) => (x < 1 ? x : x - 1.5), y: [-1, 1.5], sup: 1 },
  pole: { name: '1/|x| on [−1, 1], with f(0) = 0', a: -1, b: 1, ends: [true, true], f: (x) => (x === 0 ? 0 : 1 / Math.abs(x)), y: [-1, 12], sup: Infinity },
};
const state = { kind: 'good', N: 6 };
const K = () => CASES[state.kind];
// Sample points: evenly spread, avoiding a flat grid hit of the jump/pole; ends only if the interval is closed.
const pts = () => {
  const k = K();
  const out = [];
  for (let i = 0; i < state.N; i++) out.push(k.a + ((i + 0.5) / state.N) * (k.b - k.a));
  if (k.ends[0]) out.push(k.a);
  if (k.ends[1]) out.push(k.b);
  return out;
};
const best = () => pts().reduce((m, x) => (K().f(x) > m.y ? { x, y: K().f(x) } : m), { x: 0, y: -Infinity });

createTool({
  state,
  label: 'A graph on an interval with sample points marked. As more points are added the highest one found creeps towards the top; in the broken cases the top is never reached.',
  setup: (stage, c) => createPlot(stage, { x: [-1, 7], y: [-2, 4], c }),
  draw(ctx, stage, c, plot) {
    const k = K();
    const pad = (k.b - k.a) * 0.12;
    plot.setRange([k.a - pad, k.b + pad], k.y);
    plot.axes({ xLabel: 'x', yLabel: 'f' });
    plot.fn(k.f, { color: c.ink, width: 3, domain: [k.a + (k.ends[0] ? 0 : 1e-4), k.b - (k.ends[1] ? 0 : 1e-4)] });
    k.ends.forEach((closed, i) => {
      const x = i ? k.b : k.a;
      const [px, py] = plot.toPx(x, k.f(x));
      dot(ctx, px, py, 6, closed ? c.ink : c.paper, c.ink);
    });
    if (state.kind === 'jump') {
      dot(ctx, ...plot.toPx(1, 1), 6, c.paper, c.ink);
      dot(ctx, ...plot.toPx(1, -0.5), 6, c.ink, c.ink);
    }
    for (const x of pts()) plot.point(x, Math.min(k.y[1], k.f(x)), { fill: c.b, r: 4 });
    const b = best();
    plot.point(b.x, Math.min(k.y[1], b.y), { fill: c.a, r: 7 });
    if (Number.isFinite(k.sup)) plot.segment(k.a, k.sup, k.b, k.sup, { color: c.c, width: 2, dash: [6, 4] });
  },
  controls: [
    { title: 'Hunt for the highest point' },
    { key: 'kind', label: 'Situation', options: Object.entries(CASES).map(([k, v]) => [k, v.name]) },
    { key: 'N', label: 'Sample points', min: 1, max: 60, step: 1 },
    { readout: [
      ['Highest found (coral)', () => num(best().y, 4)],
      ['Highest possible', () => (Number.isFinite(K().sup) ? num(K().sup, 3) : 'none: f is unbounded')],
      ['Is it ever reached?', () => (state.kind === 'good' ? { text: 'yes: a max exists', good: true } : { text: 'no: the guarantee breaks', good: false })],
    ] },
  ],
  tex: () => 'f\\ \\text{continuous on }[a,b]\\ \\Rightarrow\\ f(c_1)\\le f(x)\\le f(c_2)\\ \\text{for some }c_1,c_2',
});
