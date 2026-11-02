import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { simpson, num } from './_ia.js';

// A made-up daily model: T(t) = m + A cos(ω(t − 15)) + B cos(2ω(t − 11)), ω = 2π/24. The true daily average is exactly m, but (max + min)/2 is not.
const W = (2 * Math.PI) / 24;
const state = { m: 26, A: 6, B: 1.5, a: 6, b: 18 };
const T = (t) => state.m + state.A * Math.cos(W * (t - 15)) + state.B * Math.cos(2 * W * (t - 11));
const avgOver = (a, b) => simpson(T, a, b, 600) / (b - a);
const win = () => { const lo = Math.min(state.a, state.b); const hi = Math.max(state.a, state.b); return hi === lo ? [lo, lo + 1] : [lo, hi]; };
const range = () => { let lo = Infinity; let hi = -Infinity; for (let t = 0; t <= 24; t += 0.05) { const v = T(t); lo = Math.min(lo, v); hi = Math.max(hi, v); } return [lo, hi]; };

createTool({
  state,
  label: 'Temperature through a day. A dashed line marks the average over the whole day, and a shaded window marks a chosen part of the day with its own average.',
  setup: (stage, c) => createPlot(stage, { x: [0, 24], y: [10, 40], c }),
  draw(ctx, stage, c, plot) {
    const [lo, hi] = range();
    plot.setRange([0, 24], [lo - 4, hi + 4]);
    plot.axes({ xLabel: 'hour of the day', yLabel: 'temperature (°C)' });
    const [w0, w1] = win();
    plot.shade(T, null, w0, w1, c.fillB);
    plot.fn(T, { color: c.ink, width: 3 });
    plot.segment(0, avgOver(0, 24), 24, avgOver(0, 24), { color: c.a, width: 3, dash: [7, 4] });
    plot.segment(w0, avgOver(w0, w1), w1, avgOver(w0, w1), { color: c.c, width: 3 });
  },
  controls: [
    { title: 'Shape the day' },
    { key: 'm', label: 'Mean level m', min: 10, max: 35, step: 1, format: (v) => `${v}°C` },
    { key: 'A', label: 'Daily swing A', min: 0, max: 10, step: 0.5, format: (v) => `${v}°C` },
    { key: 'B', label: 'Lopsidedness B', min: 0, max: 4, step: 0.5, format: (v) => `${v}°C` },
    { key: 'a', label: 'Window starts', min: 0, max: 23, step: 1, format: (v) => `${v}:00` },
    { key: 'b', label: 'Window ends', min: 1, max: 24, step: 1, format: (v) => `${v}:00` },
    { readout: [
      ['Average over the day (integral ÷ 24)', () => `${num(avgOver(0, 24), 5)} °C`],
      ['(Highest + lowest) ÷ 2', () => `${num((range()[0] + range()[1]) / 2, 5)} °C`],
      ['Average over the window', () => `${num(avgOver(...win()), 5)} °C`],
    ] },
  ],
  tex: (s) => `T_{\\text{avg}}=\\frac{1}{24}\\int_0^{24}T(t)\\,dt=${s.m}`,
});
