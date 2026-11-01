import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

// f(x) = (x² + b x + c) / (x − d) = (x + (b + d)) + R/(x − d),  R = d² + b d + c
const state = { b: 1, c: -2, d: 1, x: 6 };
const f = (s, x) => (x * x + s.b * x + s.c) / (x - s.d);
const lineOf = (s, x) => x + s.b + s.d;
const R = (s) => s.d * s.d + s.b * s.d + s.c;

createTool({
  state,
  label: 'The graph of a fraction whose top has degree 2 and bottom degree 1. Long division writes it as a straight line plus a remainder fraction. The remainder has a constant on top and x minus d on the bottom, so it fades to zero as x gets large, and the graph settles onto the line. That line is the slant asymptote. A marker shows the gap between the graph and the line at x, which shrinks as you move it outwards.',
  setup: (stage, c) => createPlot(stage, { x: [-12, 12], y: [-14, 14], c, pad: 18 }),
  draw(ctx, stage, c, plot) {
    plot.axes();
    plot.fn((x) => lineOf(state, x), { color: c.b, width: 3, dash: [6, 5] });
    plot.segment(state.d, -14, state.d, 14, { color: c.grid, width: 2, dash: [3, 4] });
    plot.fn((x) => f(state, x), { color: c.a, width: 4 });
    plot.point(state.x, f(state, state.x), { fill: c.fillY, r: 8 });
    plot.point(state.x, lineOf(state, state.x), { fill: c.b, r: 6 });
  },
  controls: [
    { title: 'Choose the fraction' },
    { key: 'b', label: 'b in x² + bx + c', min: -4, max: 4, step: 1 },
    { key: 'c', label: 'c', min: -6, max: 6, step: 1 },
    { key: 'd', label: 'd in x − d', min: -3, max: 3, step: 1 },
    { key: 'x', label: 'Look at x =', min: -10, max: 10, step: 1 },
    { readout: [
      ['Line (quotient)', (s) => `y = x ${s.b + s.d < 0 ? '−' : '+'} ${Math.abs(s.b + s.d)}`],
      ['Remainder R', (s) => `${R(s)}`],
      ['Gap at x', (s) => (s.x === s.d ? '—' : fixed(f(s, s.x) - lineOf(s, s.x), 4))],
    ] },
  ],
  tex: (s) => `\\dfrac{x^2${s.b < 0 ? '' : '+'}${s.b}x${s.c < 0 ? '' : '+'}${s.c}}{x${s.d < 0 ? '+' : '-'}${Math.abs(s.d)}}=x${s.b + s.d < 0 ? '' : '+'}${s.b + s.d}+\\dfrac{${R(s)}}{x${s.d < 0 ? '+' : '-'}${Math.abs(s.d)}}`,
});
