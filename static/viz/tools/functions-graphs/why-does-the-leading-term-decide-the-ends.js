import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed, sig } from '../../lib/format.js';
import { evalP, showP } from './_polynomial-math.js';

const POLYS = [
  { name: 'x³ − 6x² + 2x + 10', c: [1, -6, 2, 10] },
  { name: '−x⁴ + 3x³ + 4x', c: [-1, 3, 0, 4, 0] },
  { name: '2x⁵ − 10x³ + x', c: [2, 0, -10, 0, 1, 0] },
  { name: 'x² − 4x + 5', c: [1, -4, 5] },
];
const state = { which: 0, zoom: 1 };
const P = (s = state) => POLYS[s.which].c;
const lead = (s, x) => P(s)[0] * x ** (P(s).length - 1);
const W = (s = state) => 4 * s.zoom;

createTool({
  state,
  label: 'A polynomial in coral and its leading term alone in blue. Close to zero they look quite different, because the other terms matter. As you zoom out the two curves come together and the ratio of the polynomial to its leading term tends to 1. The ends of the graph are therefore decided by the leading term alone: its sign and whether the degree is odd or even.',
  setup: (stage, c) => createPlot(stage, { x: [-4, 4], y: [-4, 4], c, pad: 18 }),
  draw(ctx, stage, c, plot) {
    const w = W();
    const top = Math.max(Math.abs(lead(state, w)), Math.abs(evalP(P(), w))) * 0.5 + 1;
    plot.setRange([-w, w], [-top, top]);
    plot.axes();
    plot.fn((x) => lead(state, x), { color: c.b, width: 3, dash: [6, 5] });
    plot.fn((x) => evalP(P(), x), { color: c.a, width: 4 });
  },
  controls: [
    { title: 'Zoom out' },
    { key: 'which', label: 'Polynomial', min: 0, max: POLYS.length - 1, step: 1, format: (v) => POLYS[v].name },
    { key: 'zoom', label: 'Zoom out', min: 1, max: 25, step: 1, format: (v) => `×${v}` },
    { readout: [
      ['Window', (s) => `x from −${W(s)} to ${W(s)}`],
      ['P(x) ÷ leading term at the right edge', (s) => ({ text: fixed(evalP(P(s), W(s)) / lead(s, W(s)), 4), good: Math.abs(evalP(P(s), W(s)) / lead(s, W(s)) - 1) < 0.05 })],
      ['Ends', (s) => `${P(s)[0] > 0 ? 'right end up' : 'right end down'}, left end ${(P(s).length - 1) % 2 === 0 ? (P(s)[0] > 0 ? 'up' : 'down') : (P(s)[0] > 0 ? 'down' : 'up')}`],
    ] },
  ],
  tex: (s) => `P(x)=${showP(P(s))}\\ \\approx\\ ${showP([P(s)[0], ...Array(P(s).length - 1).fill(0)])}\\ \\text{for large}\\ |x|`,
});
