import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

const state = { T0: 90, Ts: 20, k: 0.04, t: 15 };
const T = (s, t) => s.Ts + (s.T0 - s.Ts) * Math.exp(-s.k * t);
const rate = (s, t) => -s.k * (T(s, t) - s.Ts); // °C per minute

createTool({
  state,
  label: 'The temperature of a cup of tea against time. The curve flattens as the tea nears room temperature. A tangent at the chosen time shows the cooling rate, which is proportional to how far the tea is above room temperature. A dashed straight line shows where the tea would be if the first rate never slowed.',
  setup: (stage, c) => createPlot(stage, { c, x: [0, 90], y: [0, 100] }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 't (min)', yLabel: '°C' });
    plot.fn(() => state.Ts, { color: c.grid, dash: [6, 5], width: 2 });
    plot.segment(0, state.T0, 1 / state.k, state.Ts, { color: c.d, width: 2, dash: [6, 5] });
    plot.fn((t) => T(state, t), { color: c.a });
    const [t, y, m] = [state.t, T(state, state.t), rate(state, state.t)];
    plot.segment(t - 8, y - 8 * m, t + 8, y + 8 * m, { color: c.b, width: 3 });
    plot.point(t, y, { fill: c.b });
    plot.text('room', 80, state.Ts + 4, { size: 11, patch: false });
  },
  controls: [
    { title: 'Cool a cup of tea' },
    { key: 't', label: 'Time t (min)', min: 0, max: 80, step: 1 },
    { key: 'T0', label: 'Start temperature (°C)', min: 50, max: 100, step: 5 },
    { key: 'Ts', label: 'Room temperature (°C)', min: 0, max: 30, step: 5 },
    { key: 'k', label: 'Constant k (per min)', min: 0.02, max: 0.1, step: 0.01, format: (v) => fixed(v, 2) },
    { readout: [
      ['Tea', (s) => `${fixed(T(s, s.t), 1)} °C`],
      ['Above room', (s) => `${fixed(T(s, s.t) - s.Ts, 1)} °C`],
      ['Cooling rate', (s) => `${fixed(-rate(s, s.t), 2)} °C/min`],
    ] },
  ],
  tex: (s) => `\\dfrac{dT}{dt}=-k(T-T_s)=-${fixed(s.k, 2)}\\times ${fixed(T(s, s.t) - s.Ts, 1)}=${fixed(rate(s, s.t), 2)}\\ ^\\circ\\mathrm{C/min}`,
});
