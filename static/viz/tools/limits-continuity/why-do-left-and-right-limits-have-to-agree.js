import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

const state = { fn: 'jump', k: 1 };
const FNS = {
  jump: { name: 'A jump at x = 1', f: (x) => (x < 1 ? x : x + 1.5), left: 1, right: 2.5 },
  smooth: { name: 'No jump', f: (x) => x, left: 1, right: 1 },
};
const h = (s = state) => 1 / 2 ** s.k;
const F = (s = state) => FNS[s.fn];

createTool({
  state,
  label: 'A graph with a possible jump at x equal to 1. One marker approaches 1 from the left and another from the right. For a graph with a jump, the left marker heads for one height and the right marker for another, so no single number is the limit. Without a jump both markers head for the same height.',
  setup: (stage, c) => createPlot(stage, { x: [-0.5, 2.5], y: [-0.5, 4], c, pad: 18 }),
  draw(ctx, stage, c, plot) {
    plot.axes();
    const f = F().f;
    plot.fn(f, { color: c.ink, width: 3, domain: [-0.5, 0.9999] });
    plot.fn(f, { color: c.ink, width: 3, domain: [1, 2.5] });
    const l = 1 - h();
    const r = 1 + h();
    plot.segment(l, 0, l, f(l), { color: c.grid, width: 1 });
    plot.segment(r, 0, r, f(r), { color: c.grid, width: 1 });
    plot.point(l, f(l), { fill: c.a, r: 8 });
    plot.point(r, f(r), { fill: c.b, r: 8 });
    plot.segment(-0.5, F().left, 1, F().left, { color: c.a, width: 1, dash: [4, 4] });
    plot.segment(1, F().right, 2.5, F().right, { color: c.b, width: 1, dash: [4, 4] });
  },
  controls: [
    { title: 'Close in from both sides' },
    { key: 'fn', label: 'Graph', options: Object.entries(FNS).map(([k, v]) => [k, v.name]) },
    { key: 'k', label: 'Distance from 1, h', min: 1, max: 10, step: 1, format: (v) => fixed(1 / 2 ** v, 4) },
    { readout: [
      ['From the left, f(1 − h)', (s) => fixed(F(s).f(1 - h(s)), 4)],
      ['From the right, f(1 + h)', (s) => fixed(F(s).f(1 + h(s)), 4)],
      ['Do they agree?', (s) => ({ text: F(s).left === F(s).right ? 'yes: the limit exists' : 'no: no limit', good: F(s).left === F(s).right })],
    ] },
  ],
  tex: (s) => `\\lim_{x\\to1^-}f=${F(s).left},\\quad \\lim_{x\\to1^+}f=${F(s).right}`,
});
