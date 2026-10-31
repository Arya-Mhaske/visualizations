import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { frequency, omegaFromT } from './_shm-math.js';

const state = { T: 0.25 };
const whole = (s) => Math.floor(1 / s.T + 1e-9);

createTool({
  state,
  label: 'One second of an oscillation. Each complete cycle is shaded in turn, so counting them gives the frequency.',
  setup: (stage, c) => createPlot(stage, { x: [0, 1], y: [-1.5, 1.5], c }),
  draw(ctx, stage, c, plot) {
    const curve = (t) => Math.cos((2 * Math.PI * t) / state.T);
    for (let i = 0; i < whole(state); i++) {
      plot.shade(() => 1.4, () => -1.4, i * state.T, (i + 1) * state.T, i % 2 ? c.fillB : c.fillY);
      plot.text(String(i + 1), (i + 0.5) * state.T, 1.25, { size: 12 });
    }
    plot.axes({ xLabel: 't (s)', yLabel: 'x' });
    plot.fn(curve, { color: c.a });
  },
  controls: [
    { title: 'Count the cycles in one second' },
    { key: 'T', label: 'Period, T', min: 0.05, max: 1, step: 0.01, format: (v) => `${fixed(v, 2)} s` },
    { readout: [
      ['Whole cycles in 1 s', (s) => String(whole(s))],
      ['Frequency, f = 1/T', (s) => `${fixed(frequency(s.T), 2)} Hz`],
      ['Angular frequency, ω', (s) => `${fixed(omegaFromT(s.T), 2)} rad/s`],
      ['T × f', (s) => fixed(s.T * frequency(s.T), 2)],
    ] },
  ],
  tex: (s) => `f = \\frac{1}{T} = \\frac{1}{${fixed(s.T, 2)}} = ${fixed(frequency(s.T), 2)}\\ \\text{Hz}`,
});
