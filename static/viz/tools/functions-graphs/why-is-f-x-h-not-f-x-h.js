import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { shiftGap } from './_what-is-a-function-math.js';

const FUNCS = {
  square: { text: 'x²', f: (x) => x * x, y: [-1, 14] },
  triple: { text: '3x', f: (x) => 3 * x, y: [-1, 14] },
  same: { text: 'x', f: (x) => x, y: [-1, 8] },
};
const state = { fn: 'square', x: 2, h: 1 };
const F = (s) => FUNCS[s.fn].f;

createTool({
  state,
  label: 'The graph of a function with two points above the input x plus h. One is on the curve, at height f of x plus h. The other is at height f of x plus h, which means adding h to the height. The gap between them is shown.',
  setup: (stage, c) => createPlot(stage, { x: [-0.5, 6], y: [-1, 14], c }),
  draw(ctx, stage, c, plot) {
    const f = F(state);
    plot.setRange([-0.5, 6], FUNCS[state.fn].y);
    plot.axes({ grid: false });
    plot.fn(f, { color: c.b, width: 4 });
    const [x0, x1] = [state.x, state.x + state.h];
    plot.segment(x0, 0, x0, f(x0), { color: c.grid, width: 2, dash: [5, 4] });
    plot.segment(x1, 0, x1, Math.max(f(x1), f(x0) + state.h), { color: c.grid, width: 2, dash: [5, 4] });
    plot.segment(x1, f(x1), x1, f(x0) + state.h, { color: c.a, width: 5 });
    plot.point(x0, f(x0), { fill: c.fillY, r: 7 });
    plot.point(x1, f(x1), { fill: c.c, r: 8 });
    plot.point(x1, f(x0) + state.h, { fill: c.a, r: 8 });
    plot.text('f(x+h)', x1 + 0.15, f(x1) + (f(x1) >= f(x0) + state.h ? 0.5 : -0.5), { size: 11, align: 'left', color: c.c });
    plot.text('f(x)+h', x1 + 0.15, f(x0) + state.h + (f(x1) >= f(x0) + state.h ? -0.5 : 0.5), { size: 11, align: 'left', color: c.a });
  },
  controls: [
    { title: 'Add h inside, or outside?' },
    { key: 'fn', label: 'Function', options: [['square', 'x²'], ['triple', '3x'], ['same', 'x']] },
    { key: 'x', label: 'Input, x', min: 0, max: 4, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'h', label: 'Step, h', min: 0.5, max: 2, step: 0.5, format: (n) => fixed(n, 1) },
    { readout: [
      ['f(x + h)', (s) => fixed(F(s)(s.x + s.h), 3)],
      ['f(x) + h', (s) => fixed(F(s)(s.x) + s.h, 3)],
      ['Gap', (s) => ({ text: fixed(shiftGap(F(s), s.x, s.h), 3), good: Math.abs(shiftGap(F(s), s.x, s.h)) < 1e-9 })],
    ] },
  ],
  tex: (s) => `f(${fixed(s.x + s.h, 1)})=${fixed(F(s)(s.x + s.h), 2)}\\ \\ne\\ f(${fixed(s.x, 1)})+${fixed(s.h, 1)}=${fixed(F(s)(s.x) + s.h, 2)}`,
});
