import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed, piFrac } from '../../lib/format.js';
import { arcsecA, arcsecB } from './_inverses-math.js';

const state = { show: 'both', x: -2 };
const sec = (x) => 1 / Math.cos(x);
const P = Math.PI;
const A = () => state.show !== 'B';
const B = () => state.show !== 'A';
const val = (f) => (Math.abs(state.x) >= 1 ? (piFrac(f(state.x)) ?? fixed(f(state.x), 3)) : '—');

createTool({
  state,
  label: 'Top: the graph of secant, with the piece chosen by book A in coral and the piece chosen by book B in blue. Bottom: the inverse graph each choice gives. They agree for x of at least 1 and differ for x of at most minus 1.',
  setup: (stage, c) => ({
    top: createPlot(stage, { x: [-0.3, 1.5 * P + 0.3], y: [-4, 4], c, ticks: 'pi', pad: 24, box: (g) => ({ x: 0, y: 0, w: g.w, h: g.h * 0.5 }) }),
    low: createPlot(stage, { x: [-5, 5], y: [-0.3, 4.9], c, ticks: 'auto', pad: 24, box: (g) => ({ x: 0, y: g.h * 0.5, w: g.w, h: g.h * 0.5 }) }),
  }),
  draw(ctx, stage, c, p) {
    p.top.axes({ xLabel: 'x', yLabel: 'sec x' });
    p.top.fn(sec, { color: c.grid, width: 2 });
    if (A()) { p.top.fn(sec, { color: c.a, width: 5, domain: [0, P / 2 - 0.01] }); p.top.fn(sec, { color: c.a, width: 5, domain: [P / 2 + 0.01, P] }); }
    if (B()) { p.top.fn(sec, { color: c.b, width: 3, domain: [0, P / 2 - 0.01], dash: [8, 5] }); p.top.fn(sec, { color: c.b, width: 5, domain: [P, 1.5 * P - 0.01] }); }
    p.low.axes({ xLabel: 'x', yLabel: 'sec⁻¹ x' });
    const draw = (f, color, width, dash = []) => {
      p.low.fn(f, { color, width, domain: [1, 5], dash });
      p.low.fn(f, { color, width, domain: [-5, -1], dash });
    };
    if (A()) draw(arcsecA, c.a, 5);
    if (B()) draw(arcsecB, c.b, 3, [8, 5]);
    if (Math.abs(state.x) >= 1) {
      if (A()) p.low.point(state.x, arcsecA(state.x), { fill: c.a });
      if (B()) p.low.point(state.x, arcsecB(state.x), { fill: c.b, r: 5 });
    }
  },
  controls: [
    { title: 'Two books, two choices' },
    { key: 'show', label: 'Show', options: [['both', 'Both'], ['A', 'Book A'], ['B', 'Book B']] },
    { key: 'x', label: 'Input, x', min: -5, max: 5, step: 0.25, format: (n) => fixed(n, 2) },
    { readout: [
      ['Book A: sec⁻¹ x', () => val(arcsecA)],
      ['Book B: sec⁻¹ x', () => val(arcsecB)],
      ['sec of either answer', () => (Math.abs(state.x) >= 1 ? fixed(sec(arcsecA(state.x)), 2) : '—')],
    ] },
  ],
  tex: () => `A:\\ \\sec^{-1}x=\\cos^{-1}\\dfrac1x\\qquad B:\\ \\sec^{-1}x=\\tan^{-1}\\!\\sqrt{x^2-1}\\ \\ (x\\ge1)`,
});
