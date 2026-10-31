import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { G, exactPeriod, ratio, seriesRatio, smallPeriod, toRad } from './_pendulum-math.js';

const state = { L: 1, deg: 60, terms: 1 };
const A = (s) => toRad(s.deg);
const approx = (s) => smallPeriod(s.L) * seriesRatio(A(s), s.terms);
const off = (s, T) => (100 * (T - exactPeriod(s.L, A(s)))) / exactPeriod(s.L, A(s));

createTool({
  state,
  label: 'A graph of the pendulum period divided by the small-angle period against the starting angle. The exact curve is compared with the flat small-angle line and a series correction.',
  setup: (stage, c) => createPlot(stage, { x: [0, 170], y: [0.6, 2.6], c }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'angle (°)', yLabel: 'T ÷ T₀' });
    plot.fn(() => 1, { color: c.b, dash: [8, 5] });
    if (state.terms > 0) plot.fn((u) => seriesRatio(toRad(u), state.terms), { color: c.d, domain: [0, 170] });
    plot.fn((u) => ratio(toRad(u)), { color: c.c });
    plot.segment(state.deg, 0.6, state.deg, 2.6, { color: c.grid, width: 1 });
    plot.point(state.deg, ratio(A(state)), { fill: c.c });
    plot.point(state.deg, 1, { fill: c.b, r: 5 });
    if (state.terms > 0) plot.point(state.deg, seriesRatio(A(state), state.terms), { fill: c.d, r: 5 });
    plot.text('exact', 150, ratio(toRad(150)) + 0.1, { color: c.c, size: 11 });
    plot.text('T₀ (small angle)', 120, 1.06, { color: c.b, size: 11 });
  },
  controls: [
    { title: 'Run the lab' },
    { key: 'L', label: 'String length', min: 0.2, max: 2, step: 0.05, format: (n) => `${fixed(n, 2)} m` },
    { key: 'deg', label: 'Starting angle', min: 5, max: 170, step: 5, format: (n) => `${n}°` },
    { key: 'terms', label: 'Correction terms', options: [[0, 'None'], [1, 'One'], [2, 'Two']] },
    { readout: [
      ['Small-angle period, T₀', (s) => `${fixed(smallPeriod(s.L), 3)} s`],
      ['Exact period', (s) => `${fixed(exactPeriod(s.L, A(s)), 3)} s`],
      ['Corrected period', (s) => `${fixed(approx(s), 3)} s`],
      ['T₀ is off by', (s) => ({ text: `${fixed(off(s, smallPeriod(s.L)), 1)}%`, good: Math.abs(off(s, smallPeriod(s.L))) < 1 })],
      ['Corrected is off by', (s) => ({ text: `${fixed(off(s, approx(s)), 1)}%`, good: Math.abs(off(s, approx(s))) < 1 })],
      ['g in this lab', () => `${fixed(G, 1)} m/s²`],
    ] },
  ],
  tex: (s) => (s.terms === 0
    ? `T \\approx 2\\pi\\sqrt{\\frac{L}{g}} = ${fixed(smallPeriod(s.L), 3)}\\ \\text{s}`
    : `T \\approx 2\\pi\\sqrt{\\frac{L}{g}}\\left(1+\\frac{\\theta_0^2}{16}${s.terms === 2 ? '+\\frac{11\\theta_0^4}{3072}' : ''}\\right) = ${fixed(approx(s), 3)}\\ \\text{s}`),
});
