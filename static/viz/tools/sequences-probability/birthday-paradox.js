import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { sharedBirthday, pairs } from './_probability-math.js';

const state = { n: 23 };
const percent = (n) => 100 * sharedBirthday(n);

createTool({
  state,
  label: 'A curve of the chance that two people share a birthday against the number of people. It crosses 50 percent at 23 people.',
  setup: (stage, c) => createPlot(stage, { x: [0, 70], y: [0, 100], c }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'people', yLabel: 'P (%)' });
    plot.segment(0, 50, 70, 50, { color: c.ink, dash: [6, 5], width: 2 });
    plot.fn((x) => percent(Math.round(x)), { color: c.b });
    plot.point(state.n, percent(state.n), { fill: c.a });
    plot.text(`${fixed(percent(state.n), 1)}%`, state.n + 3, percent(state.n) - 8, { align: 'left' });
  },
  controls: [
    { title: 'Fill the room' },
    { key: 'n', label: 'People in the room', min: 2, max: 70, step: 1 },
    { readout: [
      ['Pairs n(n−1)/2', (s) => String(pairs(s.n))],
      ['P(all different)', (s) => fixed(1 - sharedBirthday(s.n), 4)],
      ['P(a shared birthday)', (s) => fixed(sharedBirthday(s.n), 4)],
    ] },
  ],
  tex: (s) => `P=1-\\dfrac{365}{365}\\cdot\\dfrac{364}{365}\\cdots\\dfrac{${366 - s.n}}{365}=${fixed(sharedBirthday(s.n), 4)}`,
});
