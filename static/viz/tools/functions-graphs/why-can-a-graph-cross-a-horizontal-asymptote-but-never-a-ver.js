import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

const state = { kind: 'h', p: 2 };
// horizontal: f(x) = (2x² + p x)/(x² + 1), asymptote y = 2, crosses where p x = 2, at x = 2/p
const fh = (s, x) => (2 * x * x + s.p * x) / (x * x + 1);
// vertical: g(x) = 1/(x − 1) + p/3, wall at x = 1, which g can never reach
const gv = (s, x) => (x === 1 ? NaN : 1 / (x - 1) + s.p / 3);

createTool({
  state,
  label: 'Two graphs. In the first, the curve has a horizontal asymptote at y equals 2 but crosses that line at one point. A horizontal asymptote only describes where the graph ends up for very large x, so the graph may do anything on the way. In the second, the curve has a vertical wall at x equal to 1. A vertical asymptote is a place where the function has no value at all, so a point on the graph cannot sit on that line.',
  setup: (stage, c) => createPlot(stage, { x: [-8, 8], y: [-4, 6], c, pad: 18 }),
  draw(ctx, stage, c, plot) {
    plot.axes();
    if (state.kind === 'h') {
      plot.segment(-8, 2, 8, 2, { color: c.b, width: 3, dash: [6, 5] });
      plot.fn((x) => fh(state, x), { color: c.a, width: 4 });
      plot.point(2 / state.p, 2, { fill: c.fillY, r: 9 });
    } else {
      plot.segment(1, -4, 1, 6, { color: c.b, width: 3, dash: [6, 5] });
      plot.fn((x) => gv(state, x), { color: c.a, width: 4 });
    }
  },
  controls: [
    { title: 'Two kinds of asymptote' },
    { key: 'kind', label: 'Graph', options: [['h', 'Horizontal asymptote'], ['v', 'Vertical asymptote']] },
    { key: 'p', label: 'Shape parameter, p', min: 1, max: 6, step: 1 },
    { readout: [
      ['Crosses its asymptote?', (s) => (s.kind === 'h' ? { text: `yes, at x = ${fixed(2 / s.p, 3)}`, good: true } : { text: 'never: x = 1 has no value', good: false })],
      ['Far to the right, f(100)', (s) => fixed(s.kind === 'h' ? fh(s, 100) : gv(s, 100), 4)],
    ] },
  ],
  tex: (s) => (s.kind === 'h' ? `\\dfrac{2x^2+${s.p}x}{x^2+1}=2\\iff ${s.p}x=2\\iff x=\\dfrac{2}{${s.p}}` : `g(1)\\ \\text{is undefined: no point of the graph has}\\ x=1`),
});
