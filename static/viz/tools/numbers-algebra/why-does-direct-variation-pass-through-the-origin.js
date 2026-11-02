import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

const state = { k: 1.5, x: 2, c: 0 };
const f = (x) => state.k * x + state.c;

createTool({
  state,
  label: 'A graph of y against x. Faint lines y = kx for several k all pass through the origin. The bold line is the chosen k plus a starting amount c. Two points mark x and 2x, with dashed drops to the axes.',
  setup: (stage, c) => createPlot(stage, { c, x: [0, 6], y: [-4, 20] }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    for (let k = 0.5; k <= 3; k += 0.5) plot.fn((x) => k * x, { color: c.grid, width: 1 });
    plot.fn(f, { color: c.a });
    const [x1, x2] = [state.x, 2 * state.x];
    plot.segment(x1, 0, x1, f(x1), { color: c.b, width: 2, dash: [4, 4] });
    plot.segment(x2, 0, x2, f(x2), { color: c.c, width: 2, dash: [4, 4] });
    plot.point(0, f(0), { fill: c.paper, r: 6 });
    plot.point(x1, f(x1), { fill: c.b });
    plot.point(x2, f(x2), { fill: c.c });
    plot.text('x', x1, -1.2, { color: c.b, size: 11, patch: false });
    plot.text('2x', x2, -1.2, { color: c.c, size: 11, patch: false });
  },
  controls: [
    { title: 'Scale and shift' },
    { key: 'k', label: 'Constant k', min: 0.5, max: 3, step: 0.5, format: (v) => fixed(v, 1) },
    { key: 'x', label: 'Input x', min: 0.5, max: 3, step: 0.5, format: (v) => fixed(v, 1) },
    { key: 'c', label: 'Starting amount c', min: -3, max: 3, step: 1 },
    { readout: [
      ['y at 0', (s) => fixed(f(0), 1)],
      ['y at x', (s) => fixed(f(s.x), 2)],
      ['y at 2x', (s) => fixed(f(2 * s.x), 2)],
      ['y(2x) ÷ y(x)', (s) => ({ text: fixed(f(2 * s.x) / f(s.x), 2), good: s.c === 0 })],
    ] },
  ],
  tex: (s) => (s.c === 0
    ? `y(0)=${fixed(s.k, 1)}\\cdot 0=0,\\quad \\dfrac{y(2x)}{y(x)}=\\dfrac{${fixed(s.k, 1)}\\cdot ${fixed(2 * s.x, 1)}}{${fixed(s.k, 1)}\\cdot ${fixed(s.x, 1)}}=2`
    : `y=${fixed(s.k, 1)}x+(${fixed(s.c, 0)}),\\quad y(0)=${fixed(s.c, 0)}\\neq 0,\\quad \\dfrac{y(2x)}{y(x)}=${fixed(f(2 * s.x) / f(s.x), 2)}\\neq 2`),
});
