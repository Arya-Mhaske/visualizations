import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

const FN = {
  sq: { f: (x) => x * x, d: (x) => 2 * x, a: 1, name: 'x² at 1' },
  rt: { f: Math.sqrt, d: (x) => 0.5 / Math.sqrt(x), a: 1, name: '√x at 1' },
  ex: { f: Math.exp, d: Math.exp, a: 0, name: 'eˣ at 0' },
};
const state = { fn: 'sq', dx: 0.8 };
const F = () => FN[state.fn];
const dy = (s = state) => FN[s.fn].d(FN[s.fn].a) * s.dx;
const Dy = (s = state) => FN[s.fn].f(FN[s.fn].a + s.dx) - FN[s.fn].f(FN[s.fn].a);

createTool({
  state,
  label: 'A curve and its tangent line at a point. At a step dx to the right, a coral bar shows the rise of the tangent, which is dy, and a blue bar shows the rise of the curve, which is the change Delta y. For small steps the two bars are almost equal.',
  setup: (stage, c) => createPlot(stage, { x: [-1, 3], y: [-1, 5], c }),
  draw(ctx, stage, c, plot) {
    const { f, d, a } = F();
    const lo = a - 1.6;
    const hi = a + 1.6;
    const ys = Array.from({ length: 41 }, (_, i) => f(Math.max(lo, 0.0001) + (i * (hi - Math.max(lo, 0.0001))) / 40));
    plot.setRange([lo, hi], [Math.min(...ys) - 0.5, Math.max(...ys) + 0.5]);
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    plot.fn(f, { color: c.ink, width: 4 });
    plot.fn((x) => f(a) + d(a) * (x - a), { color: c.a, width: 3 });
    const x1 = a + state.dx;
    plot.segment(a, f(a), x1, f(a), { color: c.grid, width: 2, dash: [4, 4] });
    plot.segment(x1, f(a), x1, f(a) + dy(), { color: c.a, width: 6 });
    plot.segment(x1 + 0.05, f(a), x1 + 0.05, f(x1), { color: c.b, width: 6 });
    plot.point(a, f(a), { fill: c.fillY, r: 8 });
  },
  controls: [
    { title: 'Take a step' },
    { key: 'fn', label: 'Curve', options: Object.entries(FN).map(([k, v]) => [k, v.name]) },
    { key: 'dx', label: 'Step, dx', min: -0.9, max: 1.5, step: 0.05, format: (v) => fixed(v, 2) },
    { readout: [
      ['dy, tangent rise', (s) => fixed(dy(s), 4)],
      ['Δy, curve rise', (s) => fixed(Dy(s), 4)],
      ['Difference', (s) => ({ text: fixed(Dy(s) - dy(s), 4), good: Math.abs(Dy(s) - dy(s)) < 0.02 })],
    ] },
  ],
  tex: (s) => `dy=f'(a)\\,dx=${fixed(dy(s), 4)}\\qquad \\Delta y=f(a+dx)-f(a)=${fixed(Dy(s), 4)}`,
});
