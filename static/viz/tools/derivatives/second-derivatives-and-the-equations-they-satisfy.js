import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

const state = { A: 2, B: 1, x: 1 };
const y = (s, x) => s.A * Math.cos(x) + s.B * Math.sin(x);
const d1 = (s, x) => -s.A * Math.sin(x) + s.B * Math.cos(x);
const d2 = (s, x) => -s.A * Math.cos(x) - s.B * Math.sin(x);
const T = Math.PI * 2;

createTool({
  state,
  label: 'The graph of y equals A cosine x plus B sine x in coral, with its first derivative in blue and its second derivative in green. The second derivative is the negative of y itself, so the green curve is the coral curve upside down. That is the equation y double prime plus y equals 0. The black dashed line, y double prime plus y, stays flat on 0 whatever A and B you choose.',
  setup: (stage, c) => createPlot(stage, { x: [-0.3, 2 * Math.PI + 0.3], y: [-4, 4], ticks: 'pi', c, pad: 18 }),
  draw(ctx, stage, c, plot) {
    plot.axes();
    plot.fn((x) => y(state, x), { color: c.a, width: 4 });
    plot.fn((x) => d1(state, x), { color: c.b, width: 2 });
    plot.fn((x) => d2(state, x), { color: c.c, width: 2 });
    plot.fn((x) => d2(state, x) + y(state, x), { color: c.ink, width: 2, dash: [5, 4] });
    plot.segment(state.x, -4, state.x, 4, { color: c.grid, width: 1 });
    plot.point(state.x, y(state, state.x), { fill: c.fillY, r: 7 });
  },
  controls: [
    { title: 'Choose A and B' },
    { key: 'A', label: 'A', min: -3, max: 3, step: 0.5 },
    { key: 'B', label: 'B', min: -3, max: 3, step: 0.5 },
    { key: 'x', label: 'Look at x =', min: 0, max: T, step: 0.1, format: (v) => v.toFixed(1) },
    { readout: [
      ['y, y′, y″', (s) => `${fixed(y(s, s.x), 3)}, ${fixed(d1(s, s.x), 3)}, ${fixed(d2(s, s.x), 3)}`],
      ['y″ + y', (s) => ({ text: fixed(d2(s, s.x) + y(s, s.x), 6), good: true })],
    ] },
  ],
  tex: (s) => `y=${s.A}\\cos x+${s.B}\\sin x,\\ y'=${-s.A}\\sin x+${s.B}\\cos x,\\ y''=${-s.A}\\cos x+${-s.B}\\sin x=-y`.replace(/\+-/g, '-'),
});
