import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';

// f(x) = x² − 1 for x < a, and c x + 1 for x ≥ a. Continuous at a when a² − 1 = c a + 1, so c = (a² − 2)/a.
const state = { a: 2, c: 2 };
const need = (s) => (s.a * s.a - 2) / s.a;
const f1 = (x) => x * x - 1;
const f2 = (s) => (x) => s.c * x + 1;
const gap = (s) => f2(s)(s.a) - f1(s.a);

const tool = createTool({
  state,
  label: 'A function made of a parabola on the left of x equals a and a straight line on the right. The constant c sets the slope of the line. When c is exactly right the two pieces meet at one point and the graph can be drawn without lifting the pen. Otherwise there is a gap, shown as the distance between an open and a closed dot.',
  setup: (stage, c) => createPlot(stage, { c, x: [-1, 5], y: [-6, 16] }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'x', yLabel: 'f(x)' });
    plot.fn(f1, { color: c.a, domain: [-1, state.a] });
    plot.fn(f2(state), { color: c.b, domain: [state.a, 5] });
    plot.segment(state.a, -6, state.a, 16, { color: c.grid, width: 1.5, dash: [4, 4] });
    plot.point(state.a, f1(state.a), { fill: c.paper, r: 6 });
    plot.point(state.a, f2(state)(state.a), { fill: c.b, r: 6 });
  },
  controls: [
    { title: 'Choose the constant' },
    { key: 'c', label: 'Constant c (slope of the right piece)', min: -3, max: 5, step: 0.25, format: (v) => v.toFixed(2) },
    { key: 'a', label: 'Where the pieces meet, a', min: 1, max: 4, step: 1 },
    { button: 'Set c so they join', onClick() { state.c = need(state); tool.update(); } },
    { readout: [
      ['Left piece at a', (s) => f1(s.a).toFixed(2)],
      ['Right piece at a', (s) => f2(s)(s.a).toFixed(2)],
      ['Gap', (s) => ({ text: Math.abs(gap(s)) < 1e-9 ? '0: continuous' : gap(s).toFixed(2), good: Math.abs(gap(s)) < 1e-9 })],
      ['Needed c', (s) => need(s).toFixed(3)],
    ] },
  ],
  tex: (s) => `a^{2}-1=ca+1\\ \\Rightarrow\\ c=\\dfrac{a^{2}-2}{a}=\\dfrac{${s.a * s.a}-2}{${s.a}}=${need(s).toFixed(3)}`,
});
