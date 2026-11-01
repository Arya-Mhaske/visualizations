import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { cooling } from './_exp-log-math.js';

// Two thermometer readings, 10 minutes apart: T1 now and T2 = T1 - drop. Newton's law gives k, then we run it backwards.
const state = { Ts: 25, T1: 60, drop: 6, Tb: 95 };
const T2 = (s) => s.T1 - s.drop;
const k = (s) => Math.log((s.T1 - s.Ts) / (T2(s) - s.Ts)) / 10;
const back = (s) => Math.log((s.Tb - s.Ts) / (s.T1 - s.Ts)) / k(s);
const T = (s, t) => cooling(t, s.T1, s.Ts, k(s));

createTool({
  state,
  label: 'A cooling curve through two thermometer readings taken ten minutes apart, extended backwards in time. The curve climbs to the brewing temperature at a moment before now, and the distance from that moment to now is how long ago the tea was made.',
  setup: (stage, c) => createPlot(stage, { x: [-80, 25], y: [0, 100], c, pad: 30 }),
  draw(ctx, stage, c, plot) {
    const left = -back(state) * 1.2 - 5;
    plot.setRange([left, 25], [0, 105]);
    plot.axes({ xLabel: 'minutes from now', yLabel: '°C' });
    plot.segment(left, state.Ts, 25, state.Ts, { color: c.c, width: 3, dash: [8, 5] });
    plot.fn((t) => T(state, t), { color: c.a, width: 4, domain: [-back(state), 25] });
    plot.segment(-back(state), 0, -back(state), state.Tb, { color: c.ink, width: 2, dash: [4, 4] });
    plot.point(-back(state), state.Tb, { fill: c.fillY, r: 9 });
    plot.point(0, state.T1, { fill: c.b, r: 8 });
    plot.point(10, T2(state), { fill: c.b, r: 8 });
    plot.text('brewed', -back(state), state.Tb + 7, { size: 10 });
    plot.text('now', 0, state.T1 + 7, { size: 10 });
  },
  controls: [
    { title: 'Read the thermometer' },
    { key: 'Ts', label: 'Room temperature', min: 15, max: 30, step: 1, format: (v) => `${v} °C` },
    { key: 'T1', label: 'Tea now', min: 45, max: 85, step: 1, format: (v) => `${v} °C` },
    { key: 'drop', label: 'Fall in 10 minutes', min: 1, max: 14, step: 1, format: (v) => `${v} °C` },
    { key: 'Tb', label: 'Brewed at', min: 90, max: 100, step: 1, format: (v) => `${v} °C` },
    { readout: [
      ['Reading 10 min later', (s) => `${T2(s)} °C`],
      ['Cooling constant k', (s) => `${fixed(k(s), 4)} per min`],
      ['Tea was made', (s) => ({ text: `${fixed(back(s), 0)} min ago`, good: true })],
    ] },
  ],
  tex: (s) => `k=\\dfrac{1}{10}\\ln\\dfrac{${s.T1 - s.Ts}}{${T2(s) - s.Ts}}=${fixed(k(s), 4)},\\ \\ t_{\\text{ago}}=\\dfrac{1}{k}\\ln\\dfrac{${s.Tb - s.Ts}}{${s.T1 - s.Ts}}=${fixed(back(s), 1)}`,
});
