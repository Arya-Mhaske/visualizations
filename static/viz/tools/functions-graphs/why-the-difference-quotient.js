import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { FNS, quotient } from './_what-is-a-function-math.js';

const state = { fn: 'square', x: 1, h: 1.5 };
const F = (s) => FNS[s.fn];

createTool({
  state,
  label: 'The graph of a function with two points on it, at x and at x plus h, joined by a secant line. The slope of that line is the difference quotient. A dashed line shows the tangent, which the secant approaches as h shrinks.',
  setup: (stage, c) => createPlot(stage, { x: [-0.5, 5], y: [-1, 10], c }),
  draw(ctx, stage, c, plot) {
    const { f, slope } = F(state);
    const [x0, x1] = [state.x, state.x + state.h];
    const top = Math.max(2, 1.25 * Math.max(f(x0), f(x1)));
    plot.setRange([-0.5, 5], [-0.12 * top, top]);
    plot.axes({ grid: false });
    plot.fn(f, { color: c.b, width: 4 });
    const m = quotient(f, x0, state.h);
    plot.fn((t) => f(x0) + slope(x0) * (t - x0), { color: c.grid, width: 2, dash: [6, 5], domain: [-0.5, 5] });
    plot.fn((t) => f(x0) + m * (t - x0), { color: c.a, width: 3 });
    plot.segment(x0, f(x0), x1, f(x0), { color: c.ink, width: 2, dash: [4, 4] });
    plot.segment(x1, f(x0), x1, f(x1), { color: c.ink, width: 2, dash: [4, 4] });
    plot.point(x0, f(x0), { fill: c.fillY, r: 7 });
    plot.point(x1, f(x1), { fill: c.a, r: 8 });
    plot.text('h', (x0 + x1) / 2, f(x0) - 0.06 * top, { size: 12, patch: false });
    plot.text('rise', x1 + 0.15, (f(x0) + f(x1)) / 2, { size: 11, align: 'left' });
  },
  controls: [
    { title: 'Two points, one secant' },
    { key: 'fn', label: 'Function', options: [['square', 'x²'], ['cube', 'x³'], ['root', '√x']] },
    { key: 'x', label: 'Point, x', min: 0.5, max: 3, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'h', label: 'Gap, h', min: 0.01, max: 2, step: 0.01, format: (n) => fixed(n, 2) },
    { readout: [
      ['Secant slope', (s) => fixed(quotient(F(s).f, s.x, s.h), 4)],
      ['Tangent slope', (s) => fixed(F(s).slope(s.x), 4)],
      ['Difference', (s) => fixed(Math.abs(quotient(F(s).f, s.x, s.h) - F(s).slope(s.x)), 4)],
    ] },
  ],
  tex: (s) => `\\dfrac{f(x+h)-f(x)}{h}=\\dfrac{${fixed(F(s).f(s.x + s.h), 3)}-${fixed(F(s).f(s.x), 3)}}{${fixed(s.h, 2)}}=${fixed(quotient(F(s).f, s.x, s.h), 3)}`,
});
