import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

const state = { a: -3 };
const root = (x) => Math.sqrt(x * x);

createTool({
  state,
  label: 'The graph of the square root of x squared in coral, which is a V shape, and the graph of y equals x in blue, a straight diagonal line. They agree for x of 0 or more and disagree for every negative x, where the square root of x squared is the positive number, the absolute value. A marker at x equals a shows both values.',
  setup: (stage, c) => createPlot(stage, { x: [-6, 6], y: [-6, 6], c, pad: 18 }),
  draw(ctx, stage, c, plot) {
    plot.axes();
    plot.fn((x) => x, { color: c.b, width: 4 });
    plot.fn(root, { color: c.a, width: 4 });
    plot.segment(state.a, 0, state.a, state.a, { color: c.b, width: 3 });
    plot.segment(state.a, 0, state.a, root(state.a), { color: c.a, width: 3 });
    plot.point(state.a, state.a, { fill: c.b, r: 7 });
    plot.point(state.a, root(state.a), { fill: c.a, r: 7 });
  },
  controls: [
    { title: 'Pick a number' },
    { key: 'a', label: 'a', min: -5, max: 5, step: 0.5 },
    { readout: [
      ['√(a²)', (s) => fixed(root(s.a), 2)],
      ['a', (s) => fixed(s.a, 2)],
      ['Equal?', (s) => ({ text: root(s.a) === s.a ? 'yes' : 'no: √(a²) = |a|', good: root(s.a) === s.a })],
    ] },
  ],
  tex: (s) => `\\sqrt{(${s.a})^2}=\\sqrt{${s.a * s.a}}=${root(s.a)}=|${s.a}|`,
});
