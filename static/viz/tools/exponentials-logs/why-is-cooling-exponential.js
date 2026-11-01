import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { cooling } from './_exp-log-math.js';

const state = { k: 0.1, Ts: 25, T0: 90, t: 8 };
const T = (s, t = s.t) => cooling(t, s.T0, s.Ts, s.k);
const gap = (s, t = s.t) => T(s, t) - s.Ts;
const rate = (s) => -s.k * gap(s); // dT/dt by Newton's law

createTool({
  state,
  label: 'A cup of tea cooling toward room temperature. The coral curve is its temperature. A dashed blue curve is the gap between the tea and the room, which shrinks the same way. A tangent line shows how fast the tea is cooling at the moment you choose: steep when the gap is large, gentle when it is small.',
  setup: (stage, c) => createPlot(stage, { x: [0, 40], y: [0, 100], c }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'minutes', yLabel: '°C' });
    plot.segment(0, state.Ts, 40, state.Ts, { color: c.c, width: 3, dash: [8, 5] });
    plot.text('room', 38, state.Ts + 5, { size: 10, color: c.c, patch: false });
    plot.fn((t) => gap(state, t), { color: c.b, width: 3, dash: [6, 5] });
    plot.fn((t) => T(state, t), { color: c.a, width: 4 });
    const y = T(state);
    plot.fn((t) => y + rate(state) * (t - state.t), { color: c.ink, width: 3, domain: [state.t - 6, state.t + 6] });
    plot.segment(state.t, state.Ts, state.t, y, { color: c.ink, width: 2, dash: [4, 4] });
    plot.point(state.t, y, { fill: c.a, r: 8 });
  },
  controls: [
    { title: 'Cool the tea' },
    { key: 'k', label: 'Cooling constant k', min: 0.02, max: 0.3, step: 0.01, format: (v) => fixed(v, 2) },
    { key: 'Ts', label: 'Room temperature', min: 10, max: 35, step: 1, format: (v) => `${v} °C` },
    { key: 'T0', label: 'Starting temperature', min: 50, max: 100, step: 1, format: (v) => `${v} °C` },
    { key: 't', label: 'Moment', min: 0, max: 40, step: 0.5, format: (v) => `${v} min` },
    { readout: [
      ['Temperature', (s) => `${fixed(T(s), 1)} °C`],
      ['Gap to room', (s) => `${fixed(gap(s), 1)} °C`],
      ['Cooling rate', (s) => `${fixed(rate(s), 2)} °C/min`],
      ['Rate ÷ gap', (s) => ({ text: fixed(rate(s) / gap(s), 3), good: true })],
    ] },
  ],
  tex: (s) => `\\dfrac{dT}{dt}=-k(T-T_s)=-${fixed(s.k, 2)}\\times ${fixed(gap(s), 1)}=${fixed(rate(s), 2)}`,
});
