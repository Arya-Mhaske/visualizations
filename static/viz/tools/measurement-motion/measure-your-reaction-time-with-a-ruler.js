import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { G } from '../../lib/quick.js';

const state = { d: 21 };
const time = (d) => Math.sqrt((2 * d) / 100 / G);

createTool({
  state,
  label: 'A graph of the catch distance in centimetres against reaction time. A marker shows the chosen distance and its time.',
  setup: (stage, c) => createPlot(stage, { x: [0, 0.35], y: [0, 60], c }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'reaction time (s)', yLabel: 'caught at (cm)' });
    plot.fn((t) => 50 * G * t * t, { color: c.b });
    plot.segment(0, state.d, time(state.d), state.d, { color: c.ink, dash: [5, 4], width: 2 });
    plot.segment(time(state.d), 0, time(state.d), state.d, { color: c.ink, dash: [5, 4], width: 2 });
    plot.point(time(state.d), state.d);
  },
  controls: [
    { title: 'Catch the ruler' },
    { key: 'd', label: 'Caught at (cm)', min: 2, max: 60, step: 1 },
    { readout: [
      ['Reaction time', (s) => `${fixed(time(s.d), 3)} s`],
      ['In milliseconds', (s) => `${fixed(time(s.d) * 1000, 0)} ms`],
    ] },
  ],
  tex: (s) => `t=\\sqrt{\\dfrac{2d}{g}}=\\sqrt{\\dfrac{2\\times${s.d / 100}}{9.8}}=${fixed(time(s.d), 3)}\\ \\mathrm{s}`,
});
