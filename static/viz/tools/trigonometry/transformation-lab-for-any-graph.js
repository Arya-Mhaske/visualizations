import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { line } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { BASES, transformPoint, transformed } from './_sine-cosine-math.js';

const state = { base: 'sin', A: 1.5, flipA: false, B: 2, flipB: false, C: 1, k: 1 };
const params = (s = state) => ({ A: s.flipA ? -s.A : s.A, B: s.flipB ? -s.B : s.B, C: s.C, k: s.k });
const sg = (n) => (n < 0 ? '−' : '+');

createTool({
  state,
  label: 'The graph of a chosen function in grey, and the graph of A times f of B x plus C, plus k, in coral. Five marked points on the grey graph and the points they move to on the coral graph are joined by thin lines, so you can see that every transformation moves points: A and k move them up and down, B and C move them sideways.',
  setup: (stage, c) => createPlot(stage, { x: [-7, 7], y: [-5, 5], c }),
  draw(ctx, stage, c, plot) {
    const base = BASES[state.base];
    const p = params();
    plot.setRange(base.view[0], base.view[1]);
    plot.axes({ grid: true });
    plot.fn(base.f, { color: c.grid, width: 5 });
    plot.fn(transformed(base.f, p), { color: c.a, width: 4 });
    base.points.forEach((u) => {
      const from = [u, base.f(u)];
      const to = transformPoint(from, p);
      line(ctx, ...plot.toPx(...from), ...plot.toPx(...to), { color: c.ink, width: 1, dash: [3, 3] });
      plot.point(...from, { fill: c.paper, r: 5 });
      plot.point(...to, { fill: c.a, r: 6 });
    });
  },
  controls: [
    { title: 'Choose a graph, then change it' },
    { key: 'base', label: 'Start from f(x) =', options: Object.entries(BASES).map(([k, v]) => [k, v.text]) },
    { key: 'A', label: 'Stretch up, A', min: 0.5, max: 2, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'flipA', label: 'Flip upside down (A → −A)', toggle: true },
    { key: 'B', label: 'Squeeze sideways, B', min: 0.5, max: 2, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'flipB', label: 'Mirror left–right (B → −B)', toggle: true },
    { key: 'C', label: 'Slide inside, C', min: -3, max: 3, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'k', label: 'Lift, k', min: -3, max: 3, step: 0.5, format: (n) => fixed(n, 1) },
    { readout: [
      ['Up-and-down moves', (s) => `y → ${fixed(params(s).A, 1)}·y ${sg(params(s).k)} ${fixed(Math.abs(params(s).k), 1)}`],
      ['Sideways moves', (s) => `x → (x ${sg(-params(s).C)} ${fixed(Math.abs(params(s).C), 1)}) ÷ ${fixed(params(s).B, 1)}`],
      ['Sideways shift', (s) => `${fixed(-params(s).C / params(s).B, 2)}`],
    ] },
  ],
  tex: (s) => `y=${fixed(params(s).A, 1)}\\,f(${fixed(params(s).B, 1)}x${sg(params(s).C)}${fixed(Math.abs(params(s).C), 1)})${sg(params(s).k)}${fixed(Math.abs(params(s).k), 1)}`,
});
