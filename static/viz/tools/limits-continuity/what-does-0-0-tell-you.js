import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

// f(x) = (x − r)(x − s) / (x − r): 0/0 at x = r, which cancels to x − s with a hole of height r − s
const state = { r: 2, s: -1, cancel: false };

createTool({
  state,
  label: 'A fraction whose top and bottom both have the factor x minus r. At x equal to r the fraction is 0 over 0, so it has no value. The graph is the straight line x minus s with a single hole in it. Cancelling the common factor shows the line, and the height of the hole is read off from it. 0 over 0 does not mean the answer is 0, or undefined: it means the factor has to be cancelled before you decide.',
  setup: (stage, c) => createPlot(stage, { x: [-5, 6], y: [-6, 8], c, pad: 18 }),
  draw(ctx, stage, c, plot) {
    plot.axes();
    plot.fn((x) => (x - state.r) * (x - state.s) / (x - state.r), { color: c.a, width: 4 });
    if (state.cancel) plot.fn((x) => x - state.s, { color: c.c, width: 2, dash: [6, 5] });
    plot.point(state.r, state.r - state.s, { fill: c.paper, r: 8 });
    plot.text(`hole at height ${state.r - state.s}`, state.r + 0.3, state.r - state.s + 0.8, { size: 11, align: 'left', patch: false });
  },
  controls: [
    { title: 'Choose the factors' },
    { key: 'r', label: 'Common factor, x − r', min: -3, max: 4, step: 1 },
    { key: 's', label: 'Other factor, x − s', min: -4, max: 4, step: 1 },
    { key: 'cancel', label: 'Cancel (x − r) and show the line', toggle: true },
    { readout: [
      ['Top at x = r', (s) => `${fixed((s.r - s.r) * (s.r - s.s), 0)}`],
      ['Bottom at x = r', () => '0'],
      ['Height of the hole', (s) => ({ text: `${s.r - s.s}`, good: true })],
    ] },
  ],
  tex: (s) => `\\dfrac{(x-${s.r})(x-${s.s})}{x-${s.r}}=x-${s.s}\\ (x\\ne ${s.r})\\ \\Rightarrow\\ \\lim_{x\\to ${s.r}}=${s.r}-${s.s}=${s.r - s.s}`.replace(/--/g, '+').replace(/-(-\d)/g, '+$1'),
});
