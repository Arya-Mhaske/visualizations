import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { trace, sumTo, num } from './_is.js';

// 1 − ½ + ⅓ − ¼ + … = ln 2. But the positive terms alone add to ∞ and the negative terms alone to −∞,
// so we can take them in any mix we like: add positives until we pass the target, then negatives until we drop under it.
const state = { target: 1.5, order: 'target', N: 400 };
function run(order, target, N) {
  const out = [0];
  let s = 0;
  if (order === 'natural') {
    for (let n = 1; n <= N; n++) { s += (n % 2 ? 1 : -1) / n; out.push(s); }
    return { path: out, pos: Math.ceil(N / 2), neg: Math.floor(N / 2) };
  }
  let p = 0;
  let q = 0;
  for (let i = 0; i < N; i++) {
    if (s <= target) { p += 1; s += 1 / (2 * p - 1); } else { q += 1; s -= 1 / (2 * q); }
    out.push(s);
  }
  return { path: out, pos: p, neg: q };
}
const R = () => run(state.order, state.target, state.N);

createTool({
  state,
  label: 'The running total as terms are added, either in the natural order, where it settles at ln 2, or in a rearranged order that homes in on the target the student picks.',
  setup: (stage, c) => createPlot(stage, { x: [0, 400], y: [-1, 3], c }),
  draw(ctx, stage, c, plot) {
    plot.setRange([0, state.N], [Math.min(-0.5, state.target - 1), Math.max(1.2, state.target + 1)]);
    plot.axes({ xLabel: 'terms used', yLabel: 'running total' });
    plot.segment(0, Math.LN2, state.N, Math.LN2, { color: c.b, width: 2, dash: [6, 4] });
    plot.text('ln 2', state.N * 0.94, Math.LN2 + 0.1, { color: c.b });
    if (state.order === 'target') {
      plot.segment(0, state.target, state.N, state.target, { color: c.c, width: 3, dash: [7, 4] });
      plot.text('target', state.N * 0.9, state.target + 0.1, { color: c.c });
    }
    const path = R().path;
    const step = Math.max(1, Math.floor(path.length / 500));
    const pts = [];
    for (let i = 0; i < path.length; i += step) pts.push([i, path[i]]);
    pts.push([path.length - 1, path[path.length - 1]]);
    trace(ctx, plot, pts, c.a, 2);
  },
  controls: [
    { title: 'Choose the order' },
    { key: 'order', label: 'Order of the terms', options: [['natural', 'Natural'], ['target', 'Aim at a target']] },
    { key: 'target', label: 'Target sum', min: -1.5, max: 3, step: 0.05, format: (v) => v.toFixed(2) },
    { key: 'N', label: 'Terms used', min: 20, max: 2000, step: 10 },
    { readout: [
      ['Running total', () => R().path[state.N].toFixed(4)],
      ['Positive terms used', () => String(R().pos)],
      ['Negative terms used', () => String(R().neg)],
      ['Positive terms alone', () => `${num(sumTo((k) => 1 / (2 * k - 1), 1, R().pos), 3)} and growing`],
    ] },
  ],
  tex: () => '1-\\tfrac12+\\tfrac13-\\tfrac14+\\cdots=\\ln 2\\ \\text{only in this order}',
});
