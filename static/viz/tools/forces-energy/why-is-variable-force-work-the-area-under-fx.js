import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

const FN = { spring: ['Spring F = kx', (x) => 10 * x], quad: ['F = 2 + x²', (x) => 2 + x * x], wave: ['F = 5 + 4 sin x', (x) => 5 + 4 * Math.sin(x)] };
const state = { f: 'spring', n: 4, X: 4 };
const f = (s) => FN[s.f][1];
const exact = (s) => {
  const n = 2000;
  const h = s.X / n;
  let t = 0;
  for (let i = 0; i < n; i++) t += f(s)((i + 0.5) * h) * h;
  return t;
};
const sum = (s) => {
  const h = s.X / s.n;
  let t = 0;
  for (let i = 0; i < s.n; i++) t += f(s)(i * h) * h;
  return t;
};

createTool({
  state,
  label: 'A force against position graph with thin rectangles under it. The total area of the rectangles approximates the work, and gets closer to the exact area as the number of slices increases.',
  setup: (stage, c) => createPlot(stage, { x: [0, 5], y: [0, 50], c }),
  draw(ctx, stage, c, plot) {
    plot.setRange([0, state.X * 1.05], [0, Math.max(...Array.from({ length: 41 }, (_, i) => f(state)((i / 40) * state.X))) * 1.1]);
    plot.axes({ xLabel: 'x (m)', yLabel: 'F (N)' });
    const h = state.X / state.n;
    for (let i = 0; i < state.n; i++) plot.shade(() => f(state)(i * h), null, i * h, (i + 1) * h, i % 2 ? c.fillA : c.fillB);
    plot.fn(f(state), { color: c.ink, domain: [0, state.X] });
  },
  controls: [
    { title: 'Slice the area' },
    { key: 'f', label: 'Force law', options: Object.entries(FN).map(([k, v]) => [k, v[0]]) },
    { key: 'n', label: 'Slices n', min: 1, max: 40, step: 1 },
    { key: 'X', label: 'Final position x (m)', min: 1, max: 5, step: 0.5 },
    { readout: [
      ['Sum of rectangles', (s) => `${fixed(sum(s), 2)} J`],
      ['Exact area', (s) => `${fixed(exact(s), 2)} J`],
      ['Check ½kx² (spring)', (s) => (s.f === 'spring' ? `${fixed(0.5 * 10 * s.X ** 2, 2)} J` : '—')],
    ] },
  ],
  tex: (s) => `W=\\sum F(x_i)\\Delta x\\ \\to\\ \\int F\\,dx=${fixed(exact(s), 2)}\\ \\mathrm{J}`,
});
