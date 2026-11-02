import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { stackBoxes } from './_ig.js';
import { area } from './_ftc.js';

// Speedometer v(t) in km/h, t in hours. Odometer reading O(t) = O₀ + ∫₀ᵗ v. Distance between two times = O(t₂) − O(t₁) = ∫ v.
const v = (t) => 40 + 30 * Math.sin(1.2 * t) + 5 * t;
const O0 = 12000;
const state = { t1: 1, t2: 3.5 };
const O = (t) => O0 + area(v, 0, t);

const tool = createTool({
  state,
  label: 'Top: a speedometer graph of speed in kilometres per hour against time in hours, with the area between two chosen times shaded. Bottom: the odometer reading against time, a rising curve. The rise of the odometer between the two times equals the shaded area above.',
  setup: (stage, c) => ({
    top: createPlot(stage, { x: [0, 5], y: [0, 100], c, pad: 26, box: stackBoxes(2)[0] }),
    bottom: createPlot(stage, { x: [0, 5], y: [O0 - 10, O0 + 330], c, pad: 26, box: stackBoxes(2)[1] }),
  }),
  draw(ctx, stage, c, { top, bottom }) {
    top.axes({ xLabel: 't (h)', yLabel: 'speed km/h' });
    top.shade(v, null, state.t1, state.t2, c.fillB);
    top.fn(v, { color: c.a });
    bottom.axes({ xLabel: 't (h)', yLabel: 'odometer km' });
    bottom.fn(O, { color: c.b });
    bottom.segment(state.t1, O(state.t1), state.t2, O(state.t1), { color: c.ink, width: 2, dash: [5, 4] });
    bottom.segment(state.t2, O(state.t1), state.t2, O(state.t2), { color: c.a, width: 5 });
    bottom.point(state.t1, O(state.t1), { fill: c.b, r: 6 });
    bottom.point(state.t2, O(state.t2), { fill: c.b, r: 6 });
  },
  controls: () => [
    { title: 'Read the journey' },
    { key: 't1', label: 'Start time', min: 0, max: 4.5, step: 0.05, format: (x) => `${fixed(x, 2)} h` },
    { key: 't2', label: 'End time', min: 0.5, max: 5, step: 0.05, format: (x) => `${fixed(x, 2)} h` },
    { readout: [
      ['Odometer at start', (s) => `${fixed(O(s.t1), 1)} km`],
      ['Odometer at end', (s) => `${fixed(O(s.t2), 1)} km`],
      ['Difference', (s) => `${fixed(O(s.t2) - O(s.t1), 1)} km`],
      ['Area under speed', (s) => `${fixed(area(v, s.t1, s.t2), 1)} km`],
    ] },
  ],
  tex: (s) => `O(t_2)-O(t_1)=${fixed(O(s.t2), 1)}-${fixed(O(s.t1), 1)}=\\int_{t_1}^{t_2}v\\,dt=${fixed(area(v, s.t1, s.t2), 1)}`,
});

tool.update();
