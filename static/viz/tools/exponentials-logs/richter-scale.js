import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { sci, fixed } from '../../lib/format.js';

const state = { m0: 5, d: 1 };
// Gutenberg–Richter energy relation: log10 E (joules) = 1.5 M + 4.8
const energy = (m) => 10 ** (1.5 * m + 4.8);

createTool({
  state,
  label: 'Two lines show how many times bigger an earthquake is, on a digit-counting axis, as the magnitude rises. Ground motion amplitude gains one power of ten per magnitude. Energy gains one and a half powers of ten per magnitude. A marker reads both for the rise you choose.',
  setup: (stage, c) => createPlot(stage, { x: [0, 4], y: [0, 6.5], c }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'rise in magnitude', yLabel: 'log₁₀ (times bigger)' });
    plot.fn((x) => x, { color: c.b, width: 4 });
    plot.fn((x) => 1.5 * x, { color: c.a, width: 4 });
    plot.text('energy', 3.1, 1.5 * 3.1 + 0.4, { color: c.a, size: 11, patch: false });
    plot.text('amplitude', 3.1, 3.1 - 0.45, { color: c.b, size: 11, patch: false });
    plot.segment(state.d, 0, state.d, 1.5 * state.d, { color: c.grid, width: 2, dash: [4, 4] });
    plot.point(state.d, state.d, { fill: c.b, r: 8 });
    plot.point(state.d, 1.5 * state.d, { fill: c.a, r: 8 });
  },
  controls: [
    { title: 'Raise the magnitude' },
    { key: 'm0', label: 'Starting magnitude', min: 2, max: 8, step: 0.1, format: (v) => fixed(v, 1) },
    { key: 'd', label: 'Rise in magnitude', min: 0, max: 4, step: 0.1, format: (v) => fixed(v, 1) },
    { readout: [
      ['Amplitude is', (s) => `×${sci(10 ** s.d, 3)}`],
      ['Energy is', (s) => `×${sci(10 ** (1.5 * s.d), 3)}`],
      ['Energy released', (s) => `${sci(energy(s.m0), 2)} J → ${sci(energy(s.m0 + s.d), 2)} J`],
    ] },
  ],
  tex: (s) => `\\Delta M=${fixed(s.d, 1)}:\\ \\ \\text{amplitude}\\times10^{${fixed(s.d, 1)}},\\ \\ \\text{energy}\\times10^{1.5\\times ${fixed(s.d, 1)}}=\\times${fixed(10 ** (1.5 * s.d), 1)}`,
});
