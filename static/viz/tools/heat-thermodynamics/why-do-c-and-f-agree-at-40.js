import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { cToF } from './_temperature-math.js';

const state = { C: 20 };

createTool({
  state,
  label: 'A graph of degrees Fahrenheit against degrees Celsius: a straight line of slope 1.8, crossing the dashed line F equals C at minus forty.',
  setup: (stage, c) => createPlot(stage, { x: [-60, 110], y: [-80, 220], c }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: '°C', yLabel: '°F' });
    plot.fn((x) => x, { color: c.ink, dash: [6, 5] });
    plot.fn(cToF, { color: c.b });
    plot.point(-40, -40, { fill: c.c, r: 8 });
    plot.text('−40, −40', -38, -62, { align: 'left', patch: false });
    plot.point(state.C, cToF(state.C), { fill: c.a });
  },
  controls: [
    { title: 'Read the scales' },
    { key: 'C', label: 'Temperature (°C)', min: -60, max: 110, step: 1 },
    { readout: [
      ['°F', (s) => fixed(cToF(s.C), 1)],
      ['°F − °C', (s) => fixed(cToF(s.C) - s.C, 1)],
      ['Agree?', (s) => ({ text: s.C === -40 ? 'yes' : 'no', good: s.C === -40 })],
    ] },
  ],
  tex: (s) => `F=1.8\\times(${s.C})+32=${fixed(cToF(s.C), 1)}\\qquad C=1.8C+32\\Rightarrow C=-40`,
});
