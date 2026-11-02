import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { num } from './_ia.js';

// Waiting time T at a counter with arrival rate λ per minute: f(t) = λ e^(−λt). P(T ≤ t) = 1 − e^(−λt). Mean 1/λ.
// Memoryless: having already waited s minutes tells you nothing: P(T > s + t | T > s) = P(T > t).
const state = { lam: 0.5, t: 2, s: 3 };
const f = (t) => (t < 0 ? 0 : state.lam * Math.exp(-state.lam * t));
const within = () => 1 - Math.exp(-state.lam * state.t);
const beyond = (t) => Math.exp(-state.lam * t);

createTool({
  state,
  label: 'The exponential density for waiting time, with the area up to a chosen time shaded. A second shaded area shows the chance of waiting at least t more minutes after already waiting s, which equals the chance from the start.',
  setup: (stage, c) => createPlot(stage, { x: [0, 12], y: [0, 1], c }),
  draw(ctx, stage, c, plot) {
    plot.setRange([0, 14], [0, Math.max(0.3, state.lam * 1.15)]);
    plot.axes({ xLabel: 'waiting time (min)', yLabel: 'density f' });
    plot.shade(f, null, 0, state.t, c.fillB);
    plot.shade(f, null, state.s + state.t, 14, c.fillA);
    plot.fn(f, { color: c.ink, width: 3 });
    plot.segment(state.s, 0, state.s, state.lam * 1.1, { color: c.ink, width: 1.5, dash: [4, 4] });
    plot.segment(1 / state.lam, 0, 1 / state.lam, f(1 / state.lam), { color: c.c, width: 3 });
  },
  controls: [
    { title: 'Wait at the counter' },
    { key: 'lam', label: 'Arrivals per minute λ', min: 0.1, max: 1.5, step: 0.05, format: (v) => v.toFixed(2) },
    { key: 't', label: 'Wait up to t', min: 0.5, max: 10, step: 0.5, format: (v) => `${v} min` },
    { key: 's', label: 'Already waited s', min: 0, max: 6, step: 0.5, format: (v) => `${v} min` },
    { readout: [
      ['P(T ≤ t), blue area', () => num(within(), 5)],
      ['Mean wait 1/λ (green)', () => `${num(1 / state.lam, 4)} min`],
      ['P(T > t) from the start', () => num(beyond(state.t), 5)],
      ['P(T > s + t) ÷ P(T > s)', () => num(beyond(state.s + state.t) / beyond(state.s), 5)],
    ] },
  ],
  tex: (s) => `P(T\\le t)=\\int_0^{t}\\lambda e^{-\\lambda u}du=1-e^{-\\lambda t}=${num(within(), 4)}`,
});
