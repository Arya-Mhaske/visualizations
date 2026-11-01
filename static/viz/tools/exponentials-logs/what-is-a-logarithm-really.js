import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { logb } from './_exp-log-math.js';

const state = { b: 2, N: 32 };
const KMAX = { 2: 11, 3: 7, 10: 3.6 };
const exactly = (s) => Math.abs(logb(s.b, s.N) - Math.round(logb(s.b, s.N))) < 1e-9;

createTool({
  state,
  label: 'A staircase of what you get by multiplying 1 by the base again and again, with a curve through the steps. A horizontal line marks your target number. Counting how many multiplications it takes to reach the line is the logarithm; the curve gives the fractional count in between steps.',
  setup: (stage, c) => createPlot(stage, { x: [0, 11], y: [0, 1100], c, pad: 30 }),
  draw(ctx, stage, c, plot) {
    const { b, N } = state;
    const L = logb(b, N);
    plot.setRange([0, KMAX[b]], [0, 1100]);
    plot.axes({ xLabel: 'multiplications', yLabel: 'number' });
    plot.segment(0, N, KMAX[b], N, { color: c.b, width: 3, dash: [6, 4] });
    plot.fn((x) => b ** x, { color: c.grid, width: 3 });
    for (let k = 0; b ** k <= 1100; k++) {
      plot.point(k, b ** k, { fill: b ** k <= N + 1e-9 ? c.a : c.fillB, r: 6 });
    }
    plot.segment(L, 0, L, N, { color: c.ink, width: 2, dash: [4, 4] });
    plot.point(L, N, { fill: c.fillY, r: 8 });
  },
  controls: [
    { title: 'How many times to reach N?' },
    { key: 'b', label: 'Multiply by', options: [[2, '2'], [3, '3'], [10, '10']] },
    { key: 'N', label: 'Target N', min: 1, max: 1000, step: 1 },
    { readout: [
      ['Whole multiplications', (s) => `${Math.floor(logb(s.b, s.N) + 1e-9)}`],
      ['Exact count, log', (s) => ({ text: fixed(logb(s.b, s.N), 4), good: exactly(s) })],
    ] },
  ],
  tex: (s) => (exactly(s)
    ? `\\log_{${s.b}}${s.N}=${Math.round(logb(s.b, s.N))}\\ \\text{because}\\ ${s.b}^{${Math.round(logb(s.b, s.N))}}=${s.N}`
    : `\\log_{${s.b}}${s.N}\\approx ${fixed(logb(s.b, s.N), 4)}\\ \\text{because}\\ ${s.b}^{${fixed(logb(s.b, s.N), 4)}}=${s.N}`),
});
