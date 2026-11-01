import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

// f(x) = (x² − 1)/(x − 1) has a hole at x = 1; the dot at x = 1 is placed wherever the student likes
const state = { dot: 5, show: true };
const g = (x) => x + 1;
const near = (h) => [g(1 - h), g(1 + h)];

createTool({
  state,
  label: 'The graph of x plus 1 with a hole at x equal to 1, where the formula x squared minus 1 over x minus 1 is not defined. You can fill the hole with a dot at any height, or remove the dot. The values of the function on either side of the hole head towards 2 whatever you do to the dot, so the limit stays 2.',
  setup: (stage, c) => createPlot(stage, { x: [-1, 3], y: [-1, 5], c, pad: 18 }),
  draw(ctx, stage, c, plot) {
    plot.axes();
    plot.fn(g, { color: c.a, width: 4 });
    plot.point(1, 2, { fill: c.paper, r: 8 });
    if (state.show) plot.point(1, state.dot, { fill: c.fillY, r: 9 });
    plot.point(0.7, g(0.7), { fill: c.b, r: 6 });
    plot.point(1.3, g(1.3), { fill: c.b, r: 6 });
  },
  controls: [
    { title: 'Play with the point at x = 1' },
    { key: 'show', label: 'Put a dot at x = 1', toggle: true },
    { key: 'dot', label: 'Height of the dot, f(1)', min: -1, max: 5, step: 0.5 },
    { readout: [
      ['f(1)', (s) => (s.show ? fixed(s.dot, 1) : 'not defined')],
      ['Values just left, just right', (s) => `${fixed(near(0.001)[0], 3)}, ${fixed(near(0.001)[1], 3)}`],
      ['Limit as x → 1', () => ({ text: '2', good: true })],
    ] },
  ],
  tex: (s) => `\\lim_{x\\to1}\\dfrac{x^2-1}{x-1}=2,\\quad f(1)=${s.show ? fixed(s.dot, 1) : '\\text{undefined}'}`,
});
