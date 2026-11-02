import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed, sig } from '../../lib/format.js';
import { TAU, cyclesPerSecond } from './_waves-math.js';

const WINDOW = 0.05; // s
const state = { k: 120, A: 5 };
const B = (s) => s.k * Math.PI;

createTool({
  state,
  label: 'The graph of I = A sin(B t) over 0.05 seconds. A coral bracket marks one period. With B = 120π there are exactly 3 cycles in 0.05 seconds, which is 60 cycles in a second.',
  setup: (stage, c) => createPlot(stage, { x: [0, WINDOW], y: [-6.5, 6.5], c, pad: 26 }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 't (s)', yLabel: 'I (A)' });
    plot.fn((t) => state.A * Math.sin(B(state) * t), { color: c.b, width: 4 });
    const T = TAU / B(state);
    for (let n = 0; n * T < WINDOW - 1e-9; n++) plot.point(n * T, 0, { fill: c.a, r: 5 });
    plot.segment(0, -state.A * 1.1 - 0.4, T, -state.A * 1.1 - 0.4, { color: c.a, width: 5 });
    plot.text(`T = ${sig(T * 1000, 3)} ms`, T / 2 + 0.003, -state.A * 1.1 - 0.9, { size: 11, color: c.a, patch: false });
  },
  controls: [
    { title: 'I = A sin(kπ t)' },
    { key: 'k', label: 'k in B = kπ', min: 20, max: 300, step: 10, format: (n) => `${n}` },
    { key: 'A', label: 'Peak current, A', min: 1, max: 6, step: 0.5, format: (n) => `${fixed(n, 1)} A` },
    { readout: [
      ['B', (s) => `${sig(B(s), 4)} per s`],
      ['Period, T = 2π/B', (s) => `${sig((TAU / B(s)) * 1000, 3)} ms`],
      ['Cycles in 0.05 s', (s) => fixed(B(s) * WINDOW / TAU, 1)],
      ['Cycles in 1 s', (s) => fixed(cyclesPerSecond(B(s)), 1)],
    ] },
  ],
  tex: (s) => `f=\\dfrac{B}{2\\pi}=\\dfrac{${s.k}\\pi}{2\\pi}=${fixed(s.k / 2, 1)}\\ \\text{Hz}`,
});
