import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

const state = { P: 100, t: 10 };
const kwh = (s) => (s.P * s.t) / 1000;

createTool({
  state,
  label: 'Energy used against time for a device of fixed power: a straight line. The point shows the energy in kilowatt-hours.',
  setup: (stage, c) => createPlot(stage, { x: [0, 24], y: [0, 6], c }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 't (h)', yLabel: 'energy (kWh)' });
    plot.fn((t) => (state.P * t) / 1000, { color: c.b });
    plot.point(state.t, kwh(state), { fill: c.a });
  },
  controls: [
    { title: 'Run a device' },
    { key: 'P', label: 'Power (W)', min: 20, max: 2000, step: 20 },
    { key: 't', label: 'Time (hours)', min: 1, max: 24, step: 1 },
    { readout: [
      ['Energy', (s) => `${fixed(kwh(s), 2)} kWh`],
      ['In joules', (s) => `${fixed(kwh(s) * 3.6, 2)} MJ`],
      ['1 kWh', () => '3.6 MJ'],
    ] },
  ],
  tex: (s) => `E=Pt=${s.P}\\ \\mathrm{W}\\times${s.t}\\ \\mathrm{h}=${fixed(kwh(s), 2)}\\ \\mathrm{kWh}=${fixed(kwh(s) * 3.6, 2)}\\ \\mathrm{MJ}`,
});
